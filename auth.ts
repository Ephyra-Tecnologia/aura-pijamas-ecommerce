import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

const ADMINS = [
  { email: process.env.ADMIN_EMAIL!, password: process.env.ADMIN_PASSWORD!, name: 'Admin' },
  { email: 'babiconche@aurapijamas.com.br', password: 'Suc3ss0#@ura', name: 'Babi' },
]

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      authorize: async (credentials) => {
        const user = ADMINS.find(
          u => u.email === credentials.email && u.password === credentials.password
        )
        if (user) return { id: user.email, email: user.email, name: user.name }
        return null
      },
    }),
  ],
  pages: { signIn: '/admin/login' },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
})