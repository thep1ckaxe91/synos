import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Palette, ShoppingCart, TrendingUp } from "lucide-react"

const stats = [
  {
    title: "Total Users",
    value: "2,543",
    change: "+12.5%",
    icon: Users,
    color: "text-chart-1",
  },
  {
    title: "Artworks",
    value: "1,234",
    change: "+8.2%",
    icon: Palette,
    color: "text-chart-2",
  },
  {
    title: "Transactions",
    value: "856",
    change: "+23.1%",
    icon: ShoppingCart,
    color: "text-chart-3",
  },
  {
    title: "Revenue",
    value: "$45,231",
    change: "+15.3%",
    icon: TrendingUp,
    color: "text-chart-4",
  },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-accent">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">New User Registrations</p>
                <p className="text-sm text-muted-foreground">12 pending approvals</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">12</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Artwork Submissions</p>
                <p className="text-sm text-muted-foreground">8 pending reviews</p>
              </div>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">8</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Purchase Requests</p>
                <p className="text-sm text-muted-foreground">5 pending confirmations</p>
              </div>
              <span className="rounded-full bg-chart-3/10 px-3 py-1 text-sm font-medium text-chart-3">5</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="h-2 w-2 rounded-full bg-primary mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">New artwork approved</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-2 w-2 rounded-full bg-accent mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">User registration approved</p>
                <p className="text-xs text-muted-foreground">15 minutes ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-2 w-2 rounded-full bg-chart-3 mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Purchase completed</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-2 w-2 rounded-full bg-chart-4 mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">New exhibition created</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
