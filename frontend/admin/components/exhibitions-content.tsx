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
import DashboardLayout from '@/components/dashboard-layout'
import ExhibitionDialog from '@/components/exhibition-dialog'
import { apiClient } from '@/lib/api-client'

interface Exhibition {
  id: number
  title: string
  description: string
  startDate?: string
  endDate?: string
  location: string
  isActive: boolean
  totalArtworks: number
  createdAt: string
}

export default function ExhibitionsContent() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [filteredExhibitions, setFilteredExhibitions] = useState<Exhibition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreateMode, setIsCreateMode] = useState(false)

  useEffect(() => {
    fetchExhibitions()
  }, [])

  useEffect(() => {
    filterExhibitions()
  }, [exhibitions, searchQuery])

  const fetchExhibitions = async () => {
    try {
      const data = await apiClient.admin.getExhibitions()
      setExhibitions(data)
    } catch (error) {
      console.error('[v0] Exhibitions fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterExhibitions = () => {
    let filtered = Array.isArray(exhibitions) ? exhibitions : []

    if (searchQuery) {
      filtered = filtered.filter((e) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredExhibitions(filtered)
  }

  const handleCreate = () => {
    setIsCreateMode(true)
    setSelectedExhibition(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (exhibition: Exhibition) => {
    setIsCreateMode(false)
    setSelectedExhibition(exhibition)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this exhibition?')) return

    try {
      await apiClient.admin.deleteExhibition(id)
      await fetchExhibitions()
    } catch (error) {
      console.error('[v0] Error deleting exhibition:', error)
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (isCreateMode) {
        await apiClient.admin.createExhibition(data)
      } else if (selectedExhibition) {
        await apiClient.admin.updateExhibition(selectedExhibition.id, data)
      }

      await fetchExhibitions()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('[v0] Error saving exhibition:', error)
    }
  }

  const getStatusBadge = (exhibition: Exhibition) => {
    const now = new Date()
    const start = exhibition.startDate ? new Date(exhibition.startDate) : null
    const end = exhibition.endDate ? new Date(exhibition.endDate) : null

    if (!start || !end) {
      return <Badge variant="outline">Draft</Badge>
    }

    if (now < start) {
      return <Badge variant="secondary">Upcoming</Badge>
    } else if (now >= start && now <= end) {
      return <Badge variant="default">Active</Badge>
    } else {
      return <Badge variant="outline">Past</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exhibition Management</h1>
            <p className="text-muted-foreground">Create and manage art exhibitions</p>
          </div>
          <Button onClick={handleCreate}>Create Exhibition</Button>
        </div>

        <div className="flex justify-between items-center">
          <Input
            placeholder="Search exhibitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Artworks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredExhibitions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No exhibitions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredExhibitions.map((exhibition) => (
                  <TableRow key={exhibition.id}>
                    <TableCell className="font-medium">{exhibition.title}</TableCell>
                    <TableCell>{exhibition.location || 'N/A'}</TableCell>
                    <TableCell>
                      {exhibition.startDate
                        ? new Date(exhibition.startDate).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {exhibition.endDate
                        ? new Date(exhibition.endDate).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{exhibition.totalArtworks}</TableCell>
                    <TableCell>{getStatusBadge(exhibition)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(exhibition)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(exhibition.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ExhibitionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        exhibition={selectedExhibition}
        isCreateMode={isCreateMode}
      />
    </DashboardLayout>
  )
}
