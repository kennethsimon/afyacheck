"use client"

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useParams, useRouter } from 'next/navigation'
import { Edit, Trash2, Loader2, Users, UserPlus, Shield, Calendar, UserCheck, UserX } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

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
        setUsers(data?.data?.users || [])
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
      month: 'short', 
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

    setIsDeleting(true)

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
      setUserToDelete(null)
      toast.success(`User ${userToDelete.name} has been deleted successfully.`)
    } catch (err) {
      console.error('Error deleting user:', err)
      toast.error("Failed to delete the user.")
    } finally {
      setIsDeleting(false)
    }
  }

  const activeUsersCount = users.filter(user => user.active).length

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-green-950/20">
      <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8">
        <div className="auto-rows-max items-start gap-4 md:gap-8">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    User Management
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Manage system users, roles, and permissions
                  </p>
                </div>
              </div>
              <Link href={`/dashboard/${projectId}/${campId}/users/add-user`}>
                <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-md gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add User
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{users.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeUsersCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 dark:border-orange-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <UserX className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Inactive Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{users.length - activeUsersCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table Card */}
          <Card className="border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                All Users
              </CardTitle>
              <CardDescription>
                View and manage all system users, their roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading users...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg">No users found</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                    Get started by adding a new user
                  </p>
                </div>
              ) : (
                <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-900">
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead className="font-semibold">Username</TableHead>
                        <TableHead className="font-semibold">Roles</TableHead>
                        <TableHead className="font-semibold">Permissions</TableHead>
                        <TableHead className="font-semibold">Created At</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-gray-400" />
                              {user.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                              {user.username}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.roles && user.roles.length > 0 ? (
                                user.roles.map((role) => (
                                  <Badge 
                                    key={role._id} 
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {role.name}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-gray-400 text-sm">No roles</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {user.permissions && user.permissions.length > 0 ? (
                                user.permissions.slice(0, 2).map((permission) => (
                                  <Badge 
                                    key={permission._id} 
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {permission.name}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-gray-400 text-sm">No permissions</span>
                              )}
                              {user.permissions && user.permissions.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{user.permissions.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              {formatDate(user.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.active ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                <UserCheck className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-gray-300 text-gray-600">
                                <UserX className="w-3 h-3 mr-1" />
                                Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEdit(user._id)}
                                className="hover:bg-blue-50 dark:hover:bg-blue-950"
                              >
                                <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setUserToDelete(user)}
                                    className="hover:bg-red-50 dark:hover:bg-red-950"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Confirm Deletion</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete the user <strong>{userToDelete?.name}</strong>? 
                                      This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setUserToDelete(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      onClick={handleDelete} 
                                      disabled={isDeleting}
                                      className="gap-2"
                                    >
                                      {isDeleting ? (
                                        <>
                                          <Loader2 className="animate-spin w-4 h-4" />
                                          Deleting...
                                        </>
                                      ) : (
                                        <>
                                          <Trash2 className="w-4 h-4" />
                                          Delete
                                        </>
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
