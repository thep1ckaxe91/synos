import { Card, CardContent } from '@/components/ui/card';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-serif text-4xl md:text-5xl mb-6">Contact Us</h1>
        
        <p className="text-lg text-muted-foreground mb-12">
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Email</h3>
              <p className="text-sm text-muted-foreground">info@synos.art</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-4">
                <Phone className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-medium mb-2">Phone</h3>
              <p className="text-sm text-muted-foreground">+84-xxx-xxx-xxx</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
                <MapPin className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-medium mb-2">Location</h3>
              <p className="text-sm text-muted-foreground">Vietnam</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-12">
          <CardContent className="p-8">
            <h2 className="font-serif text-2xl mb-4">Get In Touch</h2>
            <p className="text-muted-foreground mb-6">
              For general inquiries, partnership opportunities, or support, please reach out via email. 
              We typically respond within 24-48 hours.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">For Artists</h3>
                <p className="text-sm text-muted-foreground">
                  Questions about selling your art? Contact us at artists@synos.art
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">For Collectors</h3>
                <p className="text-sm text-muted-foreground">
                  Need help with purchases or auctions? Contact us at collectors@synos.art
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Technical Support</h3>
                <p className="text-sm text-muted-foreground">
                  Experiencing technical issues? Contact us at support@synos.art
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
