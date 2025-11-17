"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { apiClient } from "@/lib/api"
import { getImageUrl } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ExhibitionsPage() {
  const [activeExhibitions, setActiveExhibitions] = useState<any[]>([])
  const [upcomingExhibitions, setUpcomingExhibitions] = useState<any[]>([])
  const [pastExhibitions, setPastExhibitions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExhibitions()
  }, [])

  const loadExhibitions = async () => {
    try {
      const [active, upcoming, past] = await Promise.all([
        apiClient.getActiveExhibitions(),
        apiClient.getUpcomingExhibitions(),
        apiClient.getPastExhibitions(),
      ])
      setActiveExhibitions(active)
      setUpcomingExhibitions(upcoming)
      setPastExhibitions(past)
    } catch (error) {
      console.error("Failed to load exhibitions:", error)
    } finally {
      setLoading(false)
    }
  }

  const ExhibitionGrid = ({ exhibitions }: { exhibitions: any[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exhibitions.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <p className="text-muted-foreground">No exhibitions in this category.</p>
        </div>
      ) : (
        exhibitions.map((exhibition) => (
          <Link key={exhibition.id} href={`/exhibitions/${exhibition.id}`}>
            <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
              <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                <Image
                  src={getImageUrl(exhibition.featuredArtworks?.[0]?.images?.[0]?.imageUrl)}
                  alt={exhibition.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                  {exhibition.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{exhibition.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(exhibition.startDate).toLocaleDateString()} -{" "}
                    {new Date(exhibition.endDate).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))
      )}
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-muted/30 py-16">
          <div className="container px-4">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">Exhibitions</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover curated art exhibitions featuring works from contemporary artists.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container px-4">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="overflow-hidden">
                        <div className="aspect-[4/3] bg-muted animate-pulse" />
                        <CardContent className="p-6">
                          <div className="h-6 bg-muted animate-pulse rounded mb-2" />
                          <div className="h-4 bg-muted animate-pulse rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <ExhibitionGrid exhibitions={activeExhibitions} />
                )}
              </TabsContent>

              <TabsContent value="upcoming">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="overflow-hidden">
                        <div className="aspect-[4/3] bg-muted animate-pulse" />
                        <CardContent className="p-6">
                          <div className="h-6 bg-muted animate-pulse rounded mb-2" />
                          <div className="h-4 bg-muted animate-pulse rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <ExhibitionGrid exhibitions={upcomingExhibitions} />
                )}
              </TabsContent>

              <TabsContent value="past">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="overflow-hidden">
                        <div className="aspect-[4/3] bg-muted animate-pulse" />
                        <CardContent className="p-6">
                          <div className="h-6 bg-muted animate-pulse rounded mb-2" />
                          <div className="h-4 bg-muted animate-pulse rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <ExhibitionGrid exhibitions={pastExhibitions} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
