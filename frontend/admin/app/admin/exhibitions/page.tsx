"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Plus, Eye, Edit, Trash2, Calendar, MapPin, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiService } from "@/lib/api-service"
import { Exhibition } from "@/lib/types"
import { toast } from "sonner"

export default function ExhibitionManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null)
  
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    loadExhibitions()
  }, [])

  const loadExhibitions = async () => {
    try {
      setLoading(true)
      const response = await apiService.getExhibitions({ skip: 0, take: 100 })
      
      let exhibitionsData: Exhibition[] = []
      if (Array.isArray(response)) {
        exhibitionsData = response
      } else if (response.items) {
        exhibitionsData = response.items
      } else if (response.data) {
        exhibitionsData = response.data
      }
      
      const mappedExhibitions: Exhibition[] = exhibitionsData.map((item: any) => {
        let status;
        if (item.isActive) {
            status = 'Active';
        } else {
            const now = new Date();
            const startDate = new Date(item.startDate);
            if (startDate > now) {
                status = 'Upcoming';
            } else {
                status = 'Past';
            }
        }

        return {
          id: item.id,
          title: item.title,
          description: item.description,
          startDate: item.startDate,
          endDate: item.endDate,
          location: item.location,
          coverImage: item.coverImage,
          createdAt: item.createdAt,
          deletedAt: item.deletedAt,
          totalArtworks: item.totalArtworks || 0,
          totalVisitors: item.totalVisitors || 0,
          artworks: item.totalArtworks || 0,
          visitors: item.totalVisitors || 0,
          status: status,
          isActive: item.isActive
        }
      })
      
      setExhibitions(mappedExhibitions)
    } catch (error) {
      console.error('Failed to load exhibitions:', error)
      toast.error('Failed to load exhibitions')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      setActionLoading(true)
      await apiService.createExhibition(formData)
      toast.success('Exhibition created successfully')
      setShowCreateDialog(false)
      setFormData({ title: '', description: '', location: '', startDate: '', endDate: '' })
      await loadExhibitions()
    } catch (error) {
      console.error('Failed to create exhibition:', error)
      toast.error('Failed to create exhibition')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedExhibition) return
    
    try {
      setActionLoading(true)
      await apiService.updateExhibition(selectedExhibition.id, formData)
      toast.success('Exhibition updated successfully')
      setShowEditDialog(false)
      await loadExhibitions()
    } catch (error) {
      console.error('Failed to update exhibition:', error)
      toast.error('Failed to update exhibition')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedExhibition) return
    
    try {
      setActionLoading(true)
      await apiService.deleteExhibition(selectedExhibition.id)
      toast.success('Exhibition deleted successfully')
      setShowDeleteDialog(false)
      await loadExhibitions()
    } catch (error) {
      console.error('Failed to delete exhibition:', error)
      toast.error('Failed to delete exhibition')
    } finally {
      setActionLoading(false)
    }
  }

  const now = new Date()
  const activeExhibitions = exhibitions.filter(e => {
    const start = new Date(e.startDate)
    const end = new Date(e.endDate)
    return start <= now && end >= now
  })
  const upcomingExhibitions = exhibitions.filter(e => new Date(e.startDate) > now)
  const pastExhibitions = exhibitions.filter(e => new Date(e.endDate) < now)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading exhibitions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Exhibition Management</h1>
          <p className="text-muted-foreground">Create and manage art exhibitions</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Exhibition
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Exhibitions</CardTitle>
            <Calendar className="h-5 w-5 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeExhibitions.length}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Events</CardTitle>
            <Calendar className="h-5 w-5 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{upcomingExhibitions.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Visitors</CardTitle>
            <MapPin className="h-5 w-5 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">579</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active ({activeExhibitions.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingExhibitions.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastExhibitions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Exhibitions</CardTitle>
              <CardDescription>Currently running exhibitions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exhibition</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Artworks</TableHead>
                    <TableHead>Visitors</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeExhibitions.map((exhibition) => (
                    <TableRow key={exhibition.id}>
                      <TableCell className="font-medium text-foreground">{exhibition.title}</TableCell>
                      <TableCell className="text-muted-foreground">{exhibition.location}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {exhibition.startDate} - {exhibition.endDate}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{exhibition.artworks}</TableCell>
                      <TableCell className="text-muted-foreground">{exhibition.visitors}</TableCell>
                      <TableCell>
                        <Badge className="bg-accent text-accent-foreground">{exhibition.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedExhibition(exhibition)
                              setShowEditDialog(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedExhibition(exhibition)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Exhibitions</CardTitle>
              <CardDescription>Scheduled future exhibitions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exhibition</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Artworks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingExhibitions.map((exhibition) => (
                    <TableRow key={exhibition.id}>
                      <TableCell className="font-medium text-foreground">{exhibition.title}</TableCell>
                      <TableCell className="text-muted-foreground">{exhibition.location}</TableCell>
                      <TableCell className="text-muted-foreground">{exhibition.startDate}</TableCell>
                      <TableCell className="text-muted-foreground">{exhibition.endDate}</TableCell>
                      <TableCell className="text-muted-foreground">{exhibition.artworks}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{exhibition.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedExhibition(exhibition)
                              setShowEditDialog(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedExhibition(exhibition)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search past exhibitions..." className="pl-10" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Past Exhibitions</CardTitle>
              <CardDescription>Completed exhibitions archive</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exhibition</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Artworks</TableHead>
                    <TableHead>Visitors</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastExhibitions.map((exhibition) => (
                    <TableRow key={exhibition.id}>
                      <TableCell className="font-medium text-foreground">{exhibition.title}</TableCell>
                      <TableCell className="text-muted-foreground">{exhibition.location}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {exhibition.startDate} - {exhibition.endDate}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{exhibition.artworks}</TableCell>
                      <TableCell className="text-muted-foreground">{exhibition.visitors}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{exhibition.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Exhibition Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Exhibition</DialogTitle>
            <DialogDescription>Add a new art exhibition to the gallery</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Exhibition Title</Label>
              <Input 
                id="title" 
                placeholder="Enter exhibition title..." 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                rows={4} 
                placeholder="Describe the exhibition..." 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                placeholder="Gallery location..." 
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input 
                  id="start-date" 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input 
                  id="end-date" 
                  type="date" 
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Exhibition'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Exhibition Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Exhibition</DialogTitle>
            <DialogDescription>Update exhibition information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Exhibition Title</Label>
              <Input 
                id="edit-title" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description" 
                rows={4} 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input 
                id="edit-location" 
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-start-date">Start Date</Label>
                <Input 
                  id="edit-start-date" 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end-date">End Date</Label>
                <Input 
                  id="edit-end-date" 
                  type="date" 
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Exhibition Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Exhibition</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedExhibition?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
