"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // Import useRouter
import { getExhibitionDetails } from "@/lib/api";
import { GuestExhibitionViewDto } from "@/lib/types";
import Image from "next/image";
import { Header } from "@/components/header"; // Import Header
import { Footer } from "@/components/footer"; // Import Footer
import { Button } from "@/components/ui/button"; // Import Button
import { ArrowLeft } from "lucide-react"; // Import ArrowLeft icon

export default function ExhibitionDetailPage() {
  const params = useParams();
  const router = useRouter(); // Initialize useRouter
  const { id } = params;
  const [exhibition, setExhibition] = useState<GuestExhibitionViewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchExhibition = async () => {
        try {
          setLoading(true);
          const exhibitionId = Array.isArray(id) ? id[0] : id; // Handle potential array for dynamic routes
          const data = await getExhibitionDetails(exhibitionId);
          setExhibition(data);
        } catch (err) {
          setError("Failed to fetch exhibition details.");
        } finally {
          setLoading(false);
        }
      };
      fetchExhibition();
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="text-center py-10">Loading...</div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="text-center py-10 text-red-500">{error}</div>
        <Footer />
      </>
    );
  }

  if (!exhibition) {
    return (
      <>
        <Header />
        <div className="text-center py-10">Exhibition not found.</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
        <h1 className="text-4xl font-bold mb-4">{exhibition.title}</h1>
        <p className="text-lg text-gray-600 mb-2">{exhibition.location}</p>
        <p className="text-sm text-gray-500 mb-6">
          {new Date(exhibition.startDate!).toLocaleDateString()} - {new Date(exhibition.endDate!).toLocaleDateString()}
        </p>
        <p className="mb-8">{exhibition.description}</p>

        <h2 className="text-3xl font-semibold mb-6">Artworks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {exhibition.artworks.map((artwork) => (
            <div key={artwork.id} className="border rounded-lg overflow-hidden shadow-lg">
              <Image
                src={artwork.primaryImageUrl || "/placeholder.png"}
                alt={artwork.title}
                width={400}
                height={400}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{artwork.title}</h3>
                <p className="text-gray-700">{artwork.sellerName}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

