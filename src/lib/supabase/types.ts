export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    graphql_public: {
        Tables: {
            [_ in never]: never
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            graphql: {
                Args: {
                    operationName?: string
                    query?: string
                    variables?: Json
                    extensions?: Json
                }
                Returns: Json
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
    public: {
        Tables: {
            messages: {
                Row: {
                    content: string
                    created_at: string
                    html_content: string
                    id: string
                    role: Database['public']['Enums']['message_role']
                    ticket_id: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    content: string
                    created_at?: string
                    html_content: string
                    id?: string
                    role: Database['public']['Enums']['message_role']
                    ticket_id: string
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    content?: string
                    created_at?: string
                    html_content?: string
                    id?: string
                    role?: Database['public']['Enums']['message_role']
                    ticket_id?: string
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'messages_ticket_id_fkey'
                        columns: ['ticket_id']
                        isOneToOne: false
                        referencedRelation: 'tickets'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'messages_user_id_fkey'
                        columns: ['user_id']
                        isOneToOne: false
                        referencedRelation: 'users'
                        referencedColumns: ['id']
                    },
                ]
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    bio: string | null
                    created_at: string | null
                    full_name: string | null
                    id: string
                    role: Database['public']['Enums']['user_role']
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    avatar_url?: string | null
                    bio?: string | null
                    created_at?: string | null
                    full_name?: string | null
                    id?: string
                    role?: Database['public']['Enums']['user_role']
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    avatar_url?: string | null
                    bio?: string | null
                    created_at?: string | null
                    full_name?: string | null
                    id?: string
                    role?: Database['public']['Enums']['user_role']
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'profiles_user_id_fkey'
                        columns: ['user_id']
                        isOneToOne: true
                        referencedRelation: 'users'
                        referencedColumns: ['id']
                    },
                ]
            }
            tickets: {
                Row: {
                    agent_id: string | null
                    created_at: string | null
                    customer_id: string
                    description: string
                    id: string
                    status: Database['public']['Enums']['ticket_status'] | null
                    subject: string
                    updated_at: string | null
                }
                Insert: {
                    agent_id?: string | null
                    created_at?: string | null
                    customer_id: string
                    description: string
                    id?: string
                    status?: Database['public']['Enums']['ticket_status'] | null
                    subject: string
                    updated_at?: string | null
                }
                Update: {
                    agent_id?: string | null
                    created_at?: string | null
                    customer_id?: string
                    description?: string
                    id?: string
                    status?: Database['public']['Enums']['ticket_status'] | null
                    subject?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: 'tickets_agent_id_fkey'
                        columns: ['agent_id']
                        isOneToOne: false
                        referencedRelation: 'users'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'tickets_customer_id_fkey'
                        columns: ['customer_id']
                        isOneToOne: false
                        referencedRelation: 'users'
                        referencedColumns: ['id']
                    },
                ]
            }
            users: {
                Row: {
                    created_at: string | null
                    email: string
                    id: string
                    is_active: boolean | null
                    last_sign_in_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    email: string
                    id?: string
                    is_active?: boolean | null
                    last_sign_in_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    email?: string
                    id?: string
                    is_active?: boolean | null
                    last_sign_in_at?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            gen_ulid: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
        }
        Enums: {
            message_role: 'customer' | 'agent' | 'system'
            ticket_status: 'new' | 'open' | 'closed'
            user_role: 'customer' | 'agent'
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
    PublicTableNameOrOptions extends
        | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
        | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends {
        schema: keyof Database
    }
        ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
              Database[PublicTableNameOrOptions['schema']]['Views'])
        : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
          Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
          Row: infer R
      }
        ? R
        : never
    : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
            PublicSchema['Views'])
      ? (PublicSchema['Tables'] &
            PublicSchema['Views'])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
          ? R
          : never
      : never

export type TablesInsert<
    PublicTableNameOrOptions extends
        | keyof PublicSchema['Tables']
        | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends {
        schema: keyof Database
    }
        ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
        : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Insert: infer I
      }
        ? I
        : never
    : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
      ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
            Insert: infer I
        }
          ? I
          : never
      : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
        | keyof PublicSchema['Tables']
        | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends {
        schema: keyof Database
    }
        ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
        : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Update: infer U
      }
        ? U
        : never
    : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
      ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
            Update: infer U
        }
          ? U
          : never
      : never

export type Enums<
    PublicEnumNameOrOptions extends
        | keyof PublicSchema['Enums']
        | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
        ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
        : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
      ? PublicSchema['Enums'][PublicEnumNameOrOptions]
      : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        | keyof PublicSchema['CompositeTypes']
        | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
        ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
        : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
      ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
      : never
