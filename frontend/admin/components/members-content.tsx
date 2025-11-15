'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DashboardLayout from '@/components/dashboard-layout'
import ApprovalDialog from '@/components/approval-dialog'
import { mockMembers } from '@/lib/mock-data'

interface Member {
  id: number
  email: string
  fullName: string
  role: string
  phone?: string
  isActive: boolean
  createdAt: string
  status: string
  totalOrders: number
  totalSpent: number
}

export default function MembersContent() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [dialogType, setDialogType] = useState<'approve' | 'reject'>('approve')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [members, searchQuery, selectedTab])

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/admin/members')
      if (!response.ok) throw new Error('API not available')
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.log('[v0] Using mock data for members')
      setMembers(mockMembers)
    } finally {
      setIsLoading(false)
    }
  }

  const filterMembers = () => {
    let filtered = members

    if (selectedTab === 'pending') {
      filtered = filtered.filter((m) => m.status === 'Pending')
    } else if (selectedTab === 'approved') {
      filtered = filtered.filter((m) => m.status === 'Approved')
    } else if (selectedTab === 'rejected') {
      filtered = filtered.filter((m) => m.status === 'Rejected')
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (m) =>
          m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredMembers(filtered)
  }

  const handleApprove = (member: Member) => {
    setSelectedMember(member)
    setDialogType('approve')
    setIsDialogOpen(true)
  }

  const handleReject = (member: Member) => {
    setSelectedMember(member)
    setDialogType('reject')
    setIsDialogOpen(true)
  }

  const handleConfirmAction = async (reason?: string) => {
    if (!selectedMember) return

    try {
      const endpoint = dialogType === 'approve' ? 'approve' : 'reject'
      const response = await fetch(`/api/admin/members/${selectedMember.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: dialogType === 'reject' ? JSON.stringify({ reason }) : undefined,
      })

      if (response.ok) {
        await fetchMembers()
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.log(`[v0] Mock ${dialogType} action`)
      setMembers((prev) =>
        prev.map((m) =>
          m.id === selectedMember.id
            ? { ...m, status: dialogType === 'approve' ? 'Approved' : 'Rejected' }
            : m
        )
      )
      setIsDialogOpen(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="default">Approved</Badge>
      case 'Pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const pendingCount = members.filter((m) => m.status === 'Pending').length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Member Management</h1>
            <p className="text-muted-foreground">Manage member accounts and registrations</p>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Members</TabsTrigger>
              <TabsTrigger value="pending">
                Pending {pendingCount > 0 && <span className="ml-1">({pendingCount})</span>}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <TabsContent value={selectedTab} className="mt-6">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={8}>
                          <Skeleton className="h-10 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No members found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.fullName}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell className="capitalize">{member.role}</TableCell>
                        <TableCell>{getStatusBadge(member.status)}</TableCell>
                        <TableCell>{member.totalOrders}</TableCell>
                        <TableCell>${member.totalSpent.toFixed(2)}</TableCell>
                        <TableCell>{new Date(member.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          {member.status === 'Pending' && (
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" onClick={() => handleApprove(member)}>
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleReject(member)}>
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ApprovalDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmAction}
        type={dialogType}
        title={dialogType === 'approve' ? 'Approve Member' : 'Reject Member'}
        description={
          dialogType === 'approve'
            ? `Are you sure you want to approve ${selectedMember?.fullName}?`
            : `Are you sure you want to reject ${selectedMember?.fullName}? This action requires a reason.`
        }
      />
    </DashboardLayout>
  )
}
