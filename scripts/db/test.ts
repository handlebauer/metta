import { ProfileService } from '@/services/profiles'
import { UserService } from '@/services/users'

const userService = new UserService()
const profileService = new ProfileService()

export async function seedTestData() {
    try {
        // Create test user with known ID for consistent testing
        const testUser = await userService.create({
            email: 'test@example.com',
            is_active: true,
        })

        // Create test profile
        await profileService.create({
            user_id: testUser.id,
            full_name: 'Test User',
            bio: 'Test account for automated testing',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
        })

        // Create additional test cases
        const inactiveUser = await userService.create({
            email: 'inactive-test@example.com',
            is_active: false,
        })

        const noProfileUser = await userService.create({
            email: 'no-profile@example.com',
            is_active: true,
        })

        // Store test data for reference in tests
        const testData = {
            users: {
                testUser,
                inactiveUser,
                noProfileUser,
            },
            auth: {
                testUser: {
                    email: 'test@example.com',
                    password: 'test-password-123', // Note: Set this in auth.user.json
                },
            },
        }

        // Save test data for reference
        await Bun.write(
            './tests/.auth/test-data.json',
            JSON.stringify(testData, null, 2),
        )

        console.log('✅ Test seed data created successfully')
        return testData
    } catch (error) {
        console.error('❌ Error seeding test data:', error)
        throw error
    }
}

// Only run if this file is executed directly
if (require.main === module) {
    seedTestData().catch(error => {
        console.error('Failed to seed test data:', error)
        process.exit(1)
    })
}
