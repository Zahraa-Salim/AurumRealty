'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { ConfirmModal, StatusBadge } from '@/components/dashboard/DashboardShared'
import { PERMISSIONS_BY_GROUP, hasAnyPermission } from '@/lib/rbac'

type UserRecord = {
  id: number
  name: string
  email: string
  roleId: number | null
  roleName: string
  isActive: boolean
  createdAt: string
  lastActive: string | null
}

type RoleRecord = {
  id: number
  name: string
  description: string | null
  isSystem: boolean
  permissionKeys: string[]
  usersCount: number
}

type UserForm = {
  name: string
  email: string
  password: string
  roleId: string
}

type RoleForm = {
  name: string
  description: string
  permissionKeys: string[]
}

type TabKey = 'users' | 'roles'

const initials = (name: string) =>
  name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()

const fmtLastActive = (value: string | null) => {
  if (!value) return 'Never'
  const diff = Date.now() - new Date(value).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'Just now'
  if (mins < 60) return `${mins} minutes ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

export default function DashboardUsersRolesPage() {
  const { data: session, status } = useSession()
  const permissions = session?.user?.permissions ?? []

  const canViewUsers = hasAnyPermission(permissions, ['users.view'])
  const canCreateUsers = hasAnyPermission(permissions, ['users.create'])
  const canEditUsers = hasAnyPermission(permissions, ['users.edit'])
  const canViewRoles = hasAnyPermission(permissions, ['roles.view'])
  const canCreateRoles = hasAnyPermission(permissions, ['roles.create'])
  const canEditRoles = hasAnyPermission(permissions, ['roles.edit'])
  const canDeleteRoles = hasAnyPermission(permissions, ['roles.delete'])

  const availableTabs = useMemo<TabKey[]>(() => {
    const tabs: TabKey[] = []
    if (canViewUsers) tabs.push('users')
    if (canViewRoles) tabs.push('roles')
    return tabs
  }, [canViewRoles, canViewUsers])

  const [activeTab, setActiveTab] = useState<TabKey>('users')
  const [users, setUsers] = useState<UserRecord[]>([])
  const [roles, setRoles] = useState<RoleRecord[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [pageError, setPageError] = useState('')

  const [userModalOpen, setUserModalOpen] = useState(false)
  const [userForm, setUserForm] = useState<UserForm>({ name: '', email: '', password: '', roleId: '' })
  const [userError, setUserError] = useState('')
  const [savingUser, setSavingUser] = useState(false)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)

  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null)
  const [roleForm, setRoleForm] = useState<RoleForm>({ name: '', description: '', permissionKeys: [] })
  const [roleError, setRoleError] = useState('')
  const [savingRole, setSavingRole] = useState(false)
  const [deleteRoleId, setDeleteRoleId] = useState<number | null>(null)
  const [deletingRole, setDeletingRole] = useState(false)

  useEffect(() => {
    if (availableTabs.length === 0) return
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0])
    }
  }, [activeTab, availableTabs])

  useEffect(() => {
    if (status === 'loading') return

    if (canViewUsers) {
      setLoadingUsers(true)
      fetch('/api/users')
        .then(async res => {
          if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to load users')
          return res.json()
        })
        .then(data => setUsers(data))
        .catch(error => setPageError(error instanceof Error ? error.message : 'Failed to load users'))
        .finally(() => setLoadingUsers(false))
    } else {
      setLoadingUsers(false)
    }

    if (canViewRoles || canEditUsers || canCreateUsers) {
      setLoadingRoles(true)
      fetch('/api/roles')
        .then(async res => {
          if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to load roles')
          return res.json()
        })
        .then(data => {
          setRoles(data)
          setUserForm(current => ({
            ...current,
            roleId: current.roleId || String(data[0]?.id ?? ''),
          }))
        })
        .catch(error => setPageError(error instanceof Error ? error.message : 'Failed to load roles'))
        .finally(() => setLoadingRoles(false))
    } else {
      setLoadingRoles(false)
    }
  }, [canCreateUsers, canEditUsers, canViewRoles, canViewUsers, status])

  const handleUserUpdate = async (userId: number, payload: { roleId?: number; isActive?: boolean; name?: string }) => {
    setUpdatingUserId(userId)
    setPageError('')

    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, ...payload }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update user')
      }

      const updated = await res.json()
      setUsers(current => current.map(user => user.id === userId ? updated : user))
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Failed to update user')
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleCreateUser = async () => {
    if (!userForm.email.trim() || !userForm.password || !userForm.roleId) {
      setUserError('Name is optional, but email, role and temporary password are required.')
      return
    }

    setSavingUser(true)
    setUserError('')

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userForm.name.trim(),
          email: userForm.email.trim(),
          password: userForm.password,
          roleId: Number(userForm.roleId),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to create user')
      }

      const newUser = await res.json()
      setUsers(current => [...current, newUser])
      setUserModalOpen(false)
      setUserForm({ name: '', email: '', password: '', roleId: String(roles[0]?.id ?? '') })
    } catch (error) {
      setUserError(error instanceof Error ? error.message : 'Failed to create user')
    } finally {
      setSavingUser(false)
    }
  }

  const openCreateRole = () => {
    setEditingRoleId(null)
    setRoleForm({ name: '', description: '', permissionKeys: [] })
    setRoleError('')
    setRoleModalOpen(true)
  }

  const openEditRole = (role: RoleRecord) => {
    setEditingRoleId(role.id)
    setRoleForm({
      name: role.name,
      description: role.description ?? '',
      permissionKeys: role.permissionKeys,
    })
    setRoleError('')
    setRoleModalOpen(true)
  }

  const handlePermissionToggle = (permissionKey: string) => {
    setRoleForm(current => ({
      ...current,
      permissionKeys: current.permissionKeys.includes(permissionKey)
        ? current.permissionKeys.filter(key => key !== permissionKey)
        : [...current.permissionKeys, permissionKey],
    }))
  }

  const handleSaveRole = async () => {
    if (!roleForm.name.trim()) {
      setRoleError('Role name is required.')
      return
    }

    setSavingRole(true)
    setRoleError('')

    try {
      const res = await fetch(editingRoleId ? `/api/roles/${editingRoleId}` : '/api/roles', {
        method: editingRoleId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roleForm.name.trim(),
          description: roleForm.description.trim(),
          permissionKeys: roleForm.permissionKeys,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save role')
      }

      const savedRole = await res.json()
      setRoles(current => {
        if (editingRoleId) {
          return current.map(role => role.id === editingRoleId ? savedRole : role)
        }

        return [...current, savedRole].sort((a, b) => a.name.localeCompare(b.name))
      })
      setRoleModalOpen(false)
    } catch (error) {
      setRoleError(error instanceof Error ? error.message : 'Failed to save role')
    } finally {
      setSavingRole(false)
    }
  }

  const handleDeleteRole = async () => {
    if (!deleteRoleId) return

    setDeletingRole(true)
    setRoleError('')

    try {
      const res = await fetch(`/api/roles/${deleteRoleId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete role')
      }

      setRoles(current => current.filter(role => role.id !== deleteRoleId))
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Failed to delete role')
    } finally {
      setDeletingRole(false)
      setDeleteRoleId(null)
    }
  }

  if (status === 'loading') {
    return <div className="max-w-7xl mx-auto py-12 font-sans text-[14px] text-taupe">Loading permissions…</div>
  }

  if (availableTabs.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <p className="font-serif text-[24px] text-charcoal mb-3">Access restricted</p>
        <p className="font-sans text-[14px] text-taupe">Your role does not have permission to manage users or roles.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2">
          {availableTabs.includes('users') && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-full font-sans text-[13px] font-medium transition-colors border ${activeTab === 'users' ? 'bg-charcoal text-white border-charcoal' : 'bg-white text-charcoal border-light-gray hover:bg-light-gray/20'}`}
              style={{ borderWidth: '0.5px' }}
            >
              Users
            </button>
          )}
          {availableTabs.includes('roles') && (
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-4 py-2 rounded-full font-sans text-[13px] font-medium transition-colors border ${activeTab === 'roles' ? 'bg-charcoal text-white border-charcoal' : 'bg-white text-charcoal border-light-gray hover:bg-light-gray/20'}`}
              style={{ borderWidth: '0.5px' }}
            >
              Roles
            </button>
          )}
        </div>

        {activeTab === 'users' && canCreateUsers && (
          <button
            onClick={() => {
              setUserModalOpen(true)
              setUserError('')
              setUserForm({ name: '', email: '', password: '', roleId: String(roles[0]?.id ?? '') })
            }}
            className="bg-gold hover:bg-gold-dark text-charcoal font-sans text-[13px] font-medium px-6 py-2.5 rounded-full transition-colors border-none cursor-pointer"
          >
            Create user
          </button>
        )}

        {activeTab === 'roles' && canCreateRoles && (
          <button
            onClick={openCreateRole}
            className="bg-gold hover:bg-gold-dark text-charcoal font-sans text-[13px] font-medium px-6 py-2.5 rounded-full transition-colors border-none cursor-pointer"
          >
            Create role
          </button>
        )}
      </div>

      {pageError && (
        <div className="px-4 py-3 bg-error/5 border border-error/20 rounded-sm" style={{ borderWidth: '0.5px' }}>
          <p className="font-sans text-[13px] text-error">{pageError}</p>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white border border-light-gray rounded-sm overflow-x-auto" style={{ borderWidth: '0.5px' }}>
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="border-b border-light-gray bg-light-gray/10" style={{ borderWidth: '0 0 0.5px 0' }}>
                <th className="p-4 font-sans text-[12px] font-medium uppercase tracking-wider text-taupe">User</th>
                <th className="p-4 font-sans text-[12px] font-medium uppercase tracking-wider text-taupe">Email</th>
                <th className="p-4 font-sans text-[12px] font-medium uppercase tracking-wider text-taupe">Assigned role</th>
                <th className="p-4 font-sans text-[12px] font-medium uppercase tracking-wider text-taupe">Status</th>
                <th className="p-4 font-sans text-[12px] font-medium uppercase tracking-wider text-taupe">Last active</th>
                <th className="p-4 font-sans text-[12px] font-medium uppercase tracking-wider text-taupe text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="border-b border-light-gray" style={{ borderWidth: '0 0 0.5px 0' }}>
                    {Array.from({ length: 6 }).map((_, cellIndex) => (
                      <td key={cellIndex} className="p-4"><div className="h-4 bg-light-gray/60 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <p className="font-serif text-[20px] text-charcoal mb-2">No users found</p>
                    <p className="font-sans text-[14px] text-taupe">Create a user to assign one of your roles.</p>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id} className={`border-b border-light-gray last:border-0 ${!user.isActive ? 'opacity-60' : ''}`} style={{ borderWidth: index === users.length - 1 ? '0' : '0 0 0.5px 0' }}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-light-gray flex items-center justify-center">
                          <span className="font-sans text-[12px] font-medium text-charcoal">{initials(user.name)}</span>
                        </div>
                        <div>
                          <p className="font-sans text-[14px] text-charcoal font-medium">{user.name}</p>
                          <p className="font-sans text-[12px] text-taupe">Created {new Date(user.createdAt).toLocaleDateString('en-US')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-sans text-[14px] text-taupe">{user.email}</td>
                    <td className="p-4">
                      {canEditUsers ? (
                        <select
                          value={String(user.roleId ?? '')}
                          onChange={e => handleUserUpdate(user.id, { roleId: Number(e.target.value) })}
                          disabled={updatingUserId === user.id}
                          className="h-[40px] px-3 font-sans text-[13px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal"
                          style={{ borderWidth: '0.5px' }}
                        >
                          {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                          ))}
                        </select>
                      ) : (
                        <StatusBadge status={user.roleName} variant={user.roleName === 'Super Admin' ? 'gold' : 'cream'} />
                      )}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={user.isActive ? 'Active' : 'Inactive'} variant={user.isActive ? 'green' : 'gray'} />
                    </td>
                    <td className="p-4 font-sans text-[14px] text-taupe">{fmtLastActive(user.lastActive)}</td>
                    <td className="p-4 text-right">
                      {canEditUsers && (
                        <button
                          onClick={() => handleUserUpdate(user.id, { isActive: !user.isActive })}
                          disabled={updatingUserId === user.id}
                          className="font-sans text-[13px] text-charcoal hover:text-taupe bg-transparent border-none cursor-pointer p-0"
                        >
                          {updatingUserId === user.id ? 'Saving…' : user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {loadingRoles ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white border border-light-gray rounded-sm p-6" style={{ borderWidth: '0.5px' }}>
                <div className="h-5 bg-light-gray/60 rounded animate-pulse mb-3" />
                <div className="h-4 bg-light-gray/60 rounded animate-pulse mb-2" />
                <div className="h-4 bg-light-gray/60 rounded animate-pulse" />
              </div>
            ))
          ) : roles.map(role => (
            <div key={role.id} className="bg-white border border-light-gray rounded-sm p-6 space-y-4" style={{ borderWidth: '0.5px' }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-serif text-[20px] text-charcoal">{role.name}</h3>
                    <StatusBadge status={role.isSystem ? 'System' : 'Custom'} variant={role.isSystem ? 'gold' : 'cream'} />
                  </div>
                  <p className="font-sans text-[13px] text-taupe">{role.description || 'No description provided.'}</p>
                </div>
                <div className="text-right">
                  <p className="font-sans text-[11px] uppercase tracking-wider text-taupe">Users</p>
                  <p className="font-sans text-[20px] font-medium text-charcoal">{role.usersCount}</p>
                </div>
              </div>

              <div>
                <p className="font-sans text-[12px] font-medium uppercase tracking-wider text-taupe mb-2">Permissions</p>
                <div className="flex flex-wrap gap-2">
                  {role.permissionKeys.map(permissionKey => (
                    <span key={permissionKey} className="px-2.5 py-1 bg-light-gray/40 text-charcoal font-sans text-[12px] rounded-sm">
                      {permissionKey}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                {!role.isSystem && canEditRoles && (
                  <button onClick={() => openEditRole(role)} className="font-sans text-[13px] text-charcoal hover:text-taupe bg-transparent border-none cursor-pointer p-0">
                    Edit
                  </button>
                )}
                {!role.isSystem && canDeleteRoles && (
                  <button onClick={() => setDeleteRoleId(role.id)} className="font-sans text-[13px] text-error hover:text-error/70 bg-transparent border-none cursor-pointer p-0">
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/30 backdrop-blur-sm">
          <div className="bg-white rounded-sm p-8 max-w-lg w-full mx-4 shadow-xl border border-light-gray" style={{ borderWidth: '0.5px' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-[20px] text-charcoal m-0">Create user</h3>
              <button onClick={() => setUserModalOpen(false)} className="text-[24px] text-taupe hover:text-charcoal bg-transparent border-none cursor-pointer leading-none p-0">&times;</button>
            </div>
            <div className="space-y-4">
              <Field label="Full name">
                <input value={userForm.name} onChange={e => setUserForm(current => ({ ...current, name: e.target.value }))} className="h-[44px] px-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal" style={{ borderWidth: '0.5px' }} />
              </Field>
              <Field label="Email address">
                <input value={userForm.email} onChange={e => setUserForm(current => ({ ...current, email: e.target.value }))} type="email" className="h-[44px] px-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal" style={{ borderWidth: '0.5px' }} />
              </Field>
              <Field label="Temporary password">
                <input value={userForm.password} onChange={e => setUserForm(current => ({ ...current, password: e.target.value }))} type="password" className="h-[44px] px-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal" style={{ borderWidth: '0.5px' }} />
              </Field>
              <Field label="Assigned role">
                <select value={userForm.roleId} onChange={e => setUserForm(current => ({ ...current, roleId: e.target.value }))} className="h-[44px] px-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal" style={{ borderWidth: '0.5px' }}>
                  <option value="">Select role…</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </Field>
              {userError && <p className="font-sans text-[13px] text-error">{userError}</p>}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setUserModalOpen(false)} className="px-6 py-2 rounded-full font-sans text-[13px] font-medium text-charcoal bg-transparent border border-charcoal hover:bg-light-gray/20 transition-colors" style={{ borderWidth: '0.5px' }}>Cancel</button>
              <button onClick={handleCreateUser} disabled={savingUser} className="px-6 py-2 rounded-full font-sans text-[13px] font-medium text-charcoal bg-gold hover:bg-gold-dark disabled:opacity-60 transition-colors border-none cursor-pointer">
                {savingUser ? 'Creating…' : 'Create user'}
              </button>
            </div>
          </div>
        </div>
      )}

      {roleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/30 backdrop-blur-sm px-4">
          <div className="bg-white rounded-sm p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-light-gray" style={{ borderWidth: '0.5px' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-[20px] text-charcoal m-0">{editingRoleId ? 'Edit role' : 'Create role'}</h3>
              <button onClick={() => setRoleModalOpen(false)} className="text-[24px] text-taupe hover:text-charcoal bg-transparent border-none cursor-pointer leading-none p-0">&times;</button>
            </div>
            <div className="space-y-5">
              <Field label="Role name">
                <input value={roleForm.name} onChange={e => setRoleForm(current => ({ ...current, name: e.target.value }))} className="h-[44px] px-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal" style={{ borderWidth: '0.5px' }} />
              </Field>
              <Field label="Description">
                <textarea value={roleForm.description} onChange={e => setRoleForm(current => ({ ...current, description: e.target.value }))} rows={3} className="p-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm focus:outline-none focus:border-charcoal resize-y" style={{ borderWidth: '0.5px' }} />
              </Field>

              <div className="space-y-4">
                <p className="font-sans text-[13px] font-medium text-charcoal">Permissions</p>
                {PERMISSIONS_BY_GROUP.map(group => (
                  <div key={group.group} className="border border-light-gray rounded-sm p-4" style={{ borderWidth: '0.5px' }}>
                    <h4 className="font-serif text-[16px] text-charcoal mb-3">{group.group}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.permissions.map(permission => (
                        <label key={permission.key} className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={roleForm.permissionKeys.includes(permission.key)}
                            onChange={() => handlePermissionToggle(permission.key)}
                            className="mt-1"
                          />
                          <div>
                            <p className="font-sans text-[13px] font-medium text-charcoal">{permission.label}</p>
                            <p className="font-sans text-[12px] text-taupe">{permission.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {roleError && <p className="font-sans text-[13px] text-error">{roleError}</p>}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setRoleModalOpen(false)} className="px-6 py-2 rounded-full font-sans text-[13px] font-medium text-charcoal bg-transparent border border-charcoal hover:bg-light-gray/20 transition-colors" style={{ borderWidth: '0.5px' }}>Cancel</button>
              <button onClick={handleSaveRole} disabled={savingRole} className="px-6 py-2 rounded-full font-sans text-[13px] font-medium text-charcoal bg-gold hover:bg-gold-dark disabled:opacity-60 transition-colors border-none cursor-pointer">
                {savingRole ? 'Saving…' : editingRoleId ? 'Save changes' : 'Create role'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteRoleId !== null}
        onClose={() => setDeleteRoleId(null)}
        onConfirm={handleDeleteRole}
        title="Delete role"
        message="This will permanently delete the selected custom role."
        confirmLabel={deletingRole ? 'Deleting…' : 'Delete'}
        variant="danger"
      />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-sans text-[13px] font-medium text-charcoal">{label}</label>
      {children}
    </div>
  )
}
