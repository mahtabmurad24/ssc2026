'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Upload, Copy, Eye, EyeOff, Trash2, Download } from 'lucide-react'
import jsPDF from 'jspdf'

interface JerseyOrder {
  id: string
  name: string
  jerseyName: string
  class: string
  section: string
  mobileNumber: string
  size: string
  trxId: string
  paymentNumber: string
  status: string
  createdAt: string
}

interface JerseyImage {
  id: string
  title: string
  imageUrl: string
  imageType: string
  order: number
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [orders, setOrders] = useState<JerseyOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<JerseyOrder[]>([])
  const [images, setImages] = useState<JerseyImage[]>([])
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [newImage, setNewImage] = useState({
    title: '',
    imageType: 'jersey',
    file: null as File | null
  })

  useEffect(() => {
    // Check if admin is already logged in
    const adminAuth = localStorage.getItem('adminAuth')
    if (adminAuth === 'true') {
      setIsAuthenticated(true)
      fetchOrders()
      fetchImages()
    }
  }, [])

  const handleLogin = async () => {
    if (password === 'M@ht@fadmin') {
      setIsAuthenticated(true)
      localStorage.setItem('adminAuth', 'true')
      await fetchOrders()
      await fetchImages()
    } else {
      alert('Invalid password')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('adminAuth')
    setPassword('')
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?password=M@ht@fadmin`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
        filterOrders(data, statusFilter)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const filterOrders = (ordersList: JerseyOrder[], filter: string) => {
    if (filter === 'all') {
      setFilteredOrders(ordersList)
    } else {
      setFilteredOrders(ordersList.filter(order => order.status === filter))
    }
  }

  const handleStatusFilterChange = (filter: string) => {
    setStatusFilter(filter)
    filterOrders(orders, filter)
  }

  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/images?password=M@ht@fadmin`)
      if (response.ok) {
        const data = await response.json()
        setImages(data)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}?password=M@ht@fadmin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchOrders()
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return

    try {
      const response = await fetch(`/api/orders/${orderId}?password=M@ht@fadmin`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchOrders()
      }
    } catch (error) {
      console.error('Error deleting order:', error)
    }
  }

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newImage.file || !newImage.title) return

    setLoading(true)
    const formData = new FormData()
    formData.append('file', newImage.file)
    formData.append('title', newImage.title)
    formData.append('imageType', newImage.imageType)

    try {
      const response = await fetch(`/api/images?password=M@ht@fadmin`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setNewImage({ title: '', imageType: 'jersey', file: null })
        await fetchImages()
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const response = await fetch(`/api/images/${imageId}?password=M@ht@fadmin`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchImages()
      }
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  const downloadOrdersPDF = () => {
    const doc = new jsPDF()

    // Set background color for header
    doc.setFillColor(240, 240, 240)
    doc.rect(0, 0, 210, 30, 'F')

    // Title
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    const title = 'Jersey Orders Report'
    const titleWidth = doc.getTextWidth(title)
    doc.text(title, (210 - titleWidth) / 2, 20)

    // Subtitle
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    const subtitle = `Generated on ${new Date().toLocaleDateString()} - Total Orders: ${filteredOrders.length}`
    const subtitleWidth = doc.getTextWidth(subtitle)
    doc.text(subtitle, (210 - subtitleWidth) / 2, 28)

    // Table headers
    let yPosition = 45
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.setFillColor(100, 100, 100)
    doc.rect(10, yPosition - 5, 190, 10, 'F')
    doc.text('Jersey Name', 15, yPosition + 2)
    doc.text('Section', 85, yPosition + 2)
    doc.text('Size', 155, yPosition + 2)

    yPosition += 15

    // Table rows
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)

    filteredOrders.forEach((order, index) => {
      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250)
        doc.rect(10, yPosition - 5, 190, 10, 'F')
      }

      doc.text(order.jerseyName || '-', 15, yPosition + 2)
      doc.text(order.section, 85, yPosition + 2)
      doc.text(order.size, 155, yPosition + 2)

      // Draw row lines
      doc.setDrawColor(200, 200, 200)
      doc.line(10, yPosition + 5, 200, yPosition + 5)

      yPosition += 10

      // Add new page if needed
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
        // Repeat header on new page
        doc.setFillColor(240, 240, 240)
        doc.rect(0, 0, 210, 30, 'F')
        doc.setFontSize(24)
        doc.setFont('helvetica', 'bold')
        doc.text(title, (210 - titleWidth) / 2, 20)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text(subtitle, (210 - subtitleWidth) / 2, 28)
        yPosition = 45
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(255, 255, 255)
        doc.setFillColor(100, 100, 100)
        doc.rect(10, yPosition - 5, 190, 10, 'F')
        doc.text('Jersey Name', 15, yPosition + 2)
        doc.text('Section', 85, yPosition + 2)
        doc.text('Size', 155, yPosition + 2)
        yPosition += 15
        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
      }
    })

    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Page ${i} of ${pageCount}`, 10, 290)
      doc.text('Badda Alatunnessa Higher Secondary School', 210 - doc.getTextWidth('Badda Alatunnessa Higher Secondary School') - 10, 290)
    }

    doc.save('jersey-orders.pdf')
  }



  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel - Badda Alatunnessa Higher Secondary School Jersey Orders</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* Orders Section */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Orders ({filteredOrders.length} of {orders.length})</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button onClick={downloadOrdersPDF} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Label htmlFor="statusFilter">Filter by Status:</Label>
                  <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Jersey Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Payment Number</TableHead>

                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.name}</TableCell>
                        <TableCell>{order.jerseyName || '-'}</TableCell>
                        <TableCell>{order.class}</TableCell>
                        <TableCell>{order.section}</TableCell>
                        <TableCell>{order.mobileNumber}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.size}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm">
                              {showPasswords[order.id] ? order.trxId : '••••••••'}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePasswordVisibility(order.id)}
                            >
                              {showPasswords[order.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(order.trxId)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm">
                              {showPasswords[order.id] ? order.paymentNumber : '••••••••'}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(order.paymentNumber)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">
                                <Badge variant="secondary">Pending</Badge>
                              </SelectItem>
                              <SelectItem value="confirmed">
                                <Badge variant="default">Confirmed</Badge>
                              </SelectItem>
                              <SelectItem value="delivered">
                                <Badge variant="outline">Delivered</Badge>
                              </SelectItem>
                              <SelectItem value="cancelled">
                                <Badge variant="destructive">Cancelled</Badge>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(order.trxId)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy TRX ID
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(order.jerseyName || '')}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Jersey Name
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteOrder(order.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Image Management Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Image Management</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Upload Form */}
              <form onSubmit={handleImageUpload} className="mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="imageTitle">Image Title</Label>
                    <Input
                      id="imageTitle"
                      value={newImage.title}
                      onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter image title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="imageType">Image Type</Label>
                    <Select
                      value={newImage.imageType}
                      onValueChange={(value) => setNewImage(prev => ({ ...prev, imageType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jersey">Jersey</SelectItem>
                        <SelectItem value="fabric">Fabric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="imageFile">Image File</Label>
                    <Input
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewImage(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading || !newImage.file || !newImage.title}>
                  <Upload className="h-4 w-4 mr-2" />
                  {loading ? 'Uploading...' : 'Upload Image'}
                </Button>
              </form>

              {/* Images Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image) => (
                  <Card key={image.id}>
                    <CardContent className="p-4">
                      <img
                        src={image.imageUrl}
                        alt={image.title}
                        className="w-full h-48 object-cover rounded mb-2"
                      />
                      <h3 className="font-semibold">{image.title}</h3>
                      <p className="text-sm text-gray-600 capitalize">{image.imageType}</p>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteImage(image.id)}
                        className="mt-2"
                      >
                        Delete
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
