'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const Logout = () => {
  const router = useRouter()

  useEffect(() => {
    localStorage.removeItem('token')
    router.push('/login')
  }, [router])

  return <div>Logging out...</div>
}

export default Logout
