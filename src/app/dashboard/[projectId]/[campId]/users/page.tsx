"use client"

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useParams, useRouter } from 'next/navigation'
import { Edit, Trash2, Loader2 } from "lucide-react" // Loader for ShadCN
import { toast } from "sonner" // Sonner toast

type UserRole = {
  active: boolean;
  _id: string;
  name: string;
}

type UserPermission = {
  active: boolean;
  _id: string;
  name: string;
}

type User = {
  passwordReset: { active: boolean };
  roles: UserRole[];
  permissions: UserPermission[];
  active: boolean;
  _id: string;
  name: string;
  username: string;
  createdAt: string;
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const router = useRouter()
  const params = useParams();
  const campId = params.campId as string;
  const projectId = params.projectId as string;

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/auth/admin`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }

        const data = await response.json()
        setUsers(data?.data?.users)
        setError(null)
      } catch (err) {
        setError('An error occurred while fetching users')
        console.error('Error fetching users:', err)
        toast.error("An error occurred while fetching users.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleNames = (roles: UserRole[]) => {
    return roles.map(role => role.name).join(', ')
  }

  const getPermissionNames = (permissions: UserPermission[]) => {
    return permissions.map(permission => permission.name).join(', ')
  }

  const handleEdit = (userId: string) => {
    router.push(`/dashboard/${projectId}/${campId}/users/edit/${userId}`)
  }

  const handleDelete = async () => {
    if (!userToDelete) return

    setIsDeleting(true) // Show loading state while deleting

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/auth/admin/${userToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      setUsers(users.filter(user => user._id !== userToDelete._id))
      setUserToDelete(null) // Close the dialog after deletion
      toast.success(`User ${userToDelete.name} has been deleted successfully.`)
    } catch (err) {
      console.error('Error deleting user:', err)
      toast.error("Failed to delete the user.")
    } finally {
      setIsDeleting(false) // Hide loading state after deletion
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" size={50} /> {/* ShadCN Spinner */}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">User List</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{getRoleNames(user.roles)}</TableCell>
              <TableCell>{getPermissionNames(user.permissions)}</TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell>{user.active ? 'Yes' : 'No'}</TableCell>
              <TableCell style={{ display: 'flex', flexDirection: 'row' }}>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(user._id)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setUserToDelete(user)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete the user {user.name}? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setUserToDelete(null)}>Cancel</Button>
                      <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="animate-spin" size={16} /> : "Delete"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
