export async function POST(request: Request) {
    if (request.method === 'POST') {
        const payload = request.body
        console.log({ payload })
        return new Response(null, { status: 200 })
    }
}
