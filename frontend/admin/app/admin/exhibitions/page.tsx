"use client"

import { useState } from "react"
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
import { Search, Plus, Eye, Edit, Trash2, Calendar, MapPin } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data
const upcomingExhibitions = [
  {
    id: 1,
    title: "Modern Art Showcase",
    location: "Gallery Hall A",
    startDate: "2025-01-15",
    endDate: "2025-01-30",
    artworks: 24,
    status: "Upcoming",
  },
  {
    id: 2,
    title: "Digital Dreams",
    location: "Virtual Gallery",
    startDate: "2025-02-01",
    endDate: "2025-02-28",
    artworks: 18,
    status: "Upcoming",
  },
]

const activeExhibitions = [
  {
    id: 3,
    title: "Contemporary Visions",
    location: "Main Gallery",
    startDate: "2025-01-01",
    endDate: "2025-01-14",
    artworks: 32,
    status: "Active",
    visitors: 156,
  },
]

const pastExhibitions = [
  {
    id: 4,
    title: "Abstract Expressions",
    location: "Gallery Hall B",
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    artworks: 28,
    status: "Completed",
    visitors: 234,
  },
  {
    id: 5,
    title: "Photography Masters",
    location: "Photo Gallery",
    startDate: "2024-11-15",
    endDate: "2024-11-30",
    artworks: 45,
    status: "Completed",
    visitors: 189,
  },
]

export default function ExhibitionManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedExhibition, setSelectedExhibition] = useState<any>(null)

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
              <Input id="title" placeholder="Enter exhibition title..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} placeholder="Describe the exhibition..." />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Gallery location..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artworks-count">Number of Artworks</Label>
                <Input id="artworks-count" type="number" placeholder="0" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input id="start-date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input id="end-date" type="date" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCreateDialog(false)}>Create Exhibition</Button>
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
              <Input id="edit-title" defaultValue={selectedExhibition?.title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" rows={4} placeholder="Describe the exhibition..." />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input id="edit-location" defaultValue={selectedExhibition?.location} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-artworks">Number of Artworks</Label>
                <Input id="edit-artworks" type="number" defaultValue={selectedExhibition?.artworks} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-start-date">Start Date</Label>
                <Input id="edit-start-date" type="date" defaultValue={selectedExhibition?.startDate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end-date">End Date</Label>
                <Input id="edit-end-date" type="date" defaultValue={selectedExhibition?.endDate} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowEditDialog(false)}>Save Changes</Button>
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
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(false)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
