import type { User } from 'firebase/auth'
import { useState, type FC } from 'react'

import AdminAuth from './AdminAuth'
import AdminPanel from './AdminPanel'

const AdminPage: FC = () => {
  const [user, setUser] = useState<User | null>(null)

  const handleAuthChange = (user: User | null) => {
    setUser(user)
  }

  return (
    <AdminAuth onAuthChange={handleAuthChange}>
      {user && <AdminPanel adminId={user.uid} />}
    </AdminAuth>
  )
}

export default AdminPage
