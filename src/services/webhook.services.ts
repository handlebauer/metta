import crypto from 'crypto'

import { WebhookEvent } from '@/lib/schemas/webhook.schemas'
import { createClient } from '@/lib/supabase/server'

interface WebhookPayload {
    event: WebhookEvent
    data: Record<string, unknown>
    timestamp: string
    signature: string
}

function signPayload(
    payload: Omit<WebhookPayload, 'signature'>,
    secret: string,
): string {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(JSON.stringify(payload))
    return hmac.digest('hex')
}

export async function sendWebhookEvent(
    event: WebhookEvent,
    data: Record<string, unknown>,
) {
    const supabase = await createClient()

    // Find all active webhook endpoints
    const { data: endpoints, error } = await supabase
        .from('webhook_endpoints')
        .select('*')
        .eq('active', true)

    if (error) {
        console.error('Failed to fetch webhook endpoints:', error)
        return
    }

    // Send webhook to each endpoint
    const deliveryPromises = endpoints.map(async endpoint => {
        try {
            const timestamp = new Date().toISOString()
            const payloadWithoutSignature = {
                event,
                data,
                timestamp,
            }
            const signature = signPayload(
                payloadWithoutSignature,
                endpoint.secret,
            )
            const payload: WebhookPayload = {
                ...payloadWithoutSignature,
                signature,
            }

            const response = await fetch(endpoint.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Signature': signature,
                },
                body: JSON.stringify(payload),
            })

            // Log delivery attempt
            await supabase.from('webhook_delivery_attempts').insert({
                webhook_id: endpoint.id,
                event,
                payload: JSON.stringify(payload),
                response_status: response.status,
                response_body: await response.text(),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
        } catch (error) {
            console.error(
                `Failed to deliver webhook to ${endpoint.url}:`,
                error,
            )

            // Log failed delivery
            await supabase.from('webhook_delivery_attempts').insert({
                webhook_id: endpoint.id,
                event,
                payload: JSON.stringify({
                    event,
                    data,
                    timestamp: new Date().toISOString(),
                }),
                response_status: 0,
                response_body:
                    error instanceof Error ? error.message : 'Unknown error',
            })
        }
    })

    await Promise.all(deliveryPromises)
}
