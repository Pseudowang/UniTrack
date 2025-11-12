import { Suspense } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CrawlAllButton } from "@/components/crawl-all-button"
import { AddItemForm } from "@/components/add-item-form"
import { DeleteTrackedItemButton } from "@/components/delete-tracked-item-button"

export const metadata = {
  title: "UniTrack Dashboard",
  description: "Track Uniqlo product prices",
}

interface TrackedItem {
  id: string
  value: string
  productCode: string
  createdAt: Date
  lastCrawledAt?: Date
}

interface ChangeEvent {
  id: string
  trackedItemId: string
  price: number
  priceChanged: boolean
  previousPrice?: number
  detectedAt: Date
}

interface Notification {
  id: string
  changeEventId: string
  trackedItemId: string
  message: string
  read: boolean
  createdAt: Date
}

async function getTrackedItems(): Promise<TrackedItem[]> {
  // This would be replaced with actual Prisma query in production
  // await prisma.trackedItem.findMany({ where: { userId } })
  return []
}

async function getNotifications(): Promise<Notification[]> {
  // This would be replaced with actual Prisma query in production
  // await prisma.notification.findMany({ where: { userId } })
  return []
}

function TrackedItemsList({ items }: { items: TrackedItem[] }) {
  if (items.length === 0) {
    return (
      <Alert className="card-on-white">
        <AlertDescription>No items tracked yet. Add your first Uniqlo item to get started!</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="card-on-white">
          <CardHeader>
            <CardTitle className="text-lg">{item.productCode}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium">URL:</span>{" "}
                <code className="text-xs bg-secondary/30 px-2 py-1 rounded">{item.value}</code>
              </p>
              <p>
                <span className="font-medium">Added:</span> {new Date(item.createdAt).toLocaleDateString()}
              </p>
              {item.lastCrawledAt && (
                <p>
                  <span className="font-medium">Last Crawled:</span> {new Date(item.lastCrawledAt).toLocaleString()}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <DeleteTrackedItemButton itemId={item.id} />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function NotificationsList({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return (
      <Alert className="card-on-white">
        <AlertDescription>No price change notifications yet.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-3">
      {notifications.map((notif) => (
        <Card key={notif.id} className="card-on-white bg-accent/5">
          <CardContent className="pt-6">
            <p className="text-sm">{notif.message}</p>
            <p className="text-xs text-muted-foreground mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="card-on-white opacity-50">
          <CardHeader>
            <CardTitle className="h-4 bg-muted rounded w-1/3" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function DashboardPage() {
  const [trackedItems, notifications] = await Promise.all([getTrackedItems(), getNotifications()])

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">UniTrack Dashboard</h1>
          <p className="text-muted-foreground">Track Uniqlo product prices and get notified of changes</p>
        </div>

        {/* Control Panel */}
        <Card className="card-on-white border-2">
          <CardHeader>
            <CardTitle className="text-xl">Add New Item</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-10 bg-muted rounded animate-pulse" />}>
              <AddItemForm />
            </Suspense>
          </CardContent>
          <CardFooter className="justify-between border-t pt-6">
            <p className="text-sm text-muted-foreground">Paste a Uniqlo product URL or product code</p>
            <CrawlAllButton />
          </CardFooter>
        </Card>

        {/* Tracked Items Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Tracked Items ({trackedItems.length})</h2>
            <p className="text-sm text-muted-foreground">Monitor price changes for these products</p>
          </div>
          <Suspense fallback={<LoadingState />}>
            <TrackedItemsList items={trackedItems} />
          </Suspense>
        </div>

        {/* Notifications Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Recent Notifications</h2>
            <p className="text-sm text-muted-foreground">Price change alerts and updates</p>
          </div>
          <Suspense fallback={<LoadingState />}>
            <NotificationsList notifications={notifications} />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
