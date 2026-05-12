import React, {

  createContext,

  useContext,

  useState,

  useCallback,

  useEffect

} from 'react'

import axios from 'axios'

interface User {

  id: string

  name: string

  email: string

  organization: string

  avatar?: string
}

interface AuthContextType {

  user: User | null

  isAuthenticated: boolean

  login: (
    email: string,
    password: string
  ) => Promise<void>

  register: (
    name: string,
    org: string,
    email: string,
    password: string
  ) => Promise<void>

  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({

  children

}: {

  children: React.ReactNode

}) {

  const [user, setUser] = useState<User | null>(null)

  // ----------------------------------------
  // RESTORE SESSION
  // ----------------------------------------

  useEffect(() => {

    const token = localStorage.getItem('token')

    const storedUser = localStorage.getItem('user')

    if (

      token &&
      storedUser

    ) {

      setUser(
        JSON.parse(storedUser)
      )
    }

  }, [])

  // ----------------------------------------
  // LOGIN
  // ----------------------------------------

  const login = useCallback(

    async (

      email: string,

      password: string

    ) => {

      const response = await axios.post(

        'http://127.0.0.1:8000/login',

        {

          username: email,

          password

        }

      )

      const token = response.data.token

      const userData = {

        id: 'usr_' + Math.random()
          .toString(36)
          .slice(2, 10),

        name: 'SOC Analyst',

        email,

        organization: 'SecLog SIEM'
      }

      localStorage.setItem(
        'token',
        token
      )

      localStorage.setItem(
        'user',
        JSON.stringify(userData)
      )

      setUser(userData)
    },

    []

  )

  // ----------------------------------------
  // REGISTER
  // ----------------------------------------

  const register = useCallback(

    async (

      name: string,

      org: string,

      email: string,

      password: string

    ) => {

      // Temporary demo registration

      const userData = {

        id: 'usr_' + Math.random()
          .toString(36)
          .slice(2, 10),

        name,

        email,

        organization: org
      }

      localStorage.setItem(

        'user',

        JSON.stringify(userData)

      )

      setUser(userData)
    },

    []

  )

  // ----------------------------------------
  // LOGOUT
  // ----------------------------------------

  const logout = useCallback(() => {

    localStorage.removeItem(
      'token'
    )

    localStorage.removeItem(
      'user'
    )

    setUser(null)

  }, [])

  return (

    <AuthContext.Provider

      value={{

        user,

        isAuthenticated: !!user,

        login,

        register,

        logout

      }}

    >

      {children}

    </AuthContext.Provider>
  )
}

export function useAuth() {

  const ctx = useContext(AuthContext)

  if (!ctx) {

    throw new Error(

      'useAuth must be used within AuthProvider'

    )
  }

  return ctx
}