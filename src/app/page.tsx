'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Facebook, MessageCircle, Phone } from 'lucide-react'

interface JerseyImage {
  id: string
  title: string
  imageUrl: string
  imageType: string
  order: number
}

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    jerseyName: '',
    class: '',
    section: '',
    mobileNumber: '',
    size: 'M',
    trxId: '',
    paymentNumber: '',
    location: '',
    customLocation: '',
    jerseyColor: 'Blue'
  })

  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'cash' | null>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jerseyImages, setJerseyImages] = useState<JerseyImage[]>([])
  const [loading, setLoading] = useState(true)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [reportFormData, setReportFormData] = useState({
    name: '',
    email: '',
    description: ''
  })
  const [isReporting, setIsReporting] = useState(false)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/gallery')
      if (response.ok) {
        const data = await response.json()
        setJerseyImages(data)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
      // Fallback to default images
      setJerseyImages([
        { id: '1', title: 'School Jersey Design', imageUrl: '/jersey.jpg', imageType: 'jersey', order: 1 },
        { id: '2', title: 'Jersey Fabric Detail', imageUrl: '/fabric.png', imageType: 'fabric', order: 2 }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === 'jerseyColor') {
      if (value === 'Green') {
        alert('We suggest you to select blue. most of the students make blue jersey. it is the official jersey')
      }
      setFormData(prev => ({ ...prev, [field]: value }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }



  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.class) newErrors.class = 'Class is required'
    if (!formData.section) newErrors.section = 'Section is required'
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required'
    else if (!/^\+?[\d\s-]+$/.test(formData.mobileNumber)) newErrors.mobileNumber = 'Invalid mobile number'

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method'
    } else if (paymentMethod === 'bkash') {
      if (!formData.trxId.trim()) newErrors.trxId = 'Transaction ID is required'
      if (!formData.paymentNumber.trim()) newErrors.paymentNumber = 'Payment number is required'
    } else if (paymentMethod === 'cash') {
      if (!formData.location) newErrors.location = 'Location is required'
      if (formData.location === 'Other' && !formData.customLocation.trim()) newErrors.customLocation = 'Custom location is required'
    }



    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, paymentMethod })
      })

      if (response.ok) {
        alert('Order submitted successfully! We will contact you soon.')
        setFormData({
          name: '',
          jerseyName: '',
          class: '',
          section: '',
          mobileNumber: '',
          size: 'M',
          trxId: '',
          paymentNumber: '',
          location: '',
          customLocation: '',
          jerseyColor: 'Blue'
        })
        setPaymentMethod(null)
      } else {
        throw new Error('Failed to submit order')
      }
    } catch (error) {
      // Report error to Formspree
      await fetch('https://formspree.io/f/manpdaan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Order submission failed',
          formData,
          timestamp: new Date().toISOString()
        })
      })

      alert('Failed to submit order. Please try again or contact us.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsReporting(true)

    try {
      const response = await fetch('https://formspree.io/f/manpdaan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reportFormData,
          type: 'manual_error_report',
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        alert('Error report submitted successfully! Thank you for your feedback.')
        setReportFormData({
          name: '',
          email: '',
          description: ''
        })
        setIsReportDialogOpen(false)
      } else {
        throw new Error('Failed to submit error report')
      }
    } catch (error) {
      alert('Failed to submit error report. Please try again.')
    } finally {
      setIsReporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
              Badda Alatunnessa Higher Secondary School Jersey Collection
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Organized by: Mahtaf Hossain | Class: 10 | Section: Alpha
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Jersey Gallery */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-900">Jersey Design Gallery</h2>
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading gallery...</p>
              </div>
            ) : jerseyImages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No images available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {jerseyImages.map((image) => (
                  <Card key={image.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="cursor-pointer hover:opacity-90 transition-opacity">
                            <img
                              src={image.imageUrl}
                              alt={image.title}
                              className="w-full h-48 sm:h-64 object-cover"
                            />
                            <div className="p-4">
                              <h3 className="text-lg font-semibold">{image.title}</h3>
                              <p className="text-sm text-gray-600 capitalize">{image.imageType} View</p>
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
                          <img
                            src={image.imageUrl}
                            alt={image.title}
                            className="w-full h-auto max-h-[70vh] sm:max-h-[80vh] object-contain"
                          />
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Order Form */}
        <section className="mb-8 sm:mb-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl text-center">Place Your Jersey Order</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <Label htmlFor="jerseyName">Jersey Back Name</Label>
                      <Input
                        id="jerseyName"
                        value={formData.jerseyName}
                        onChange={(e) => handleInputChange('jerseyName', e.target.value)}
                        placeholder="Enter jersey name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="jerseyColor">Jersey Color *</Label>
                      <select
                        id="jerseyColor"
                        value={formData.jerseyColor}
                        onChange={(e) => handleInputChange('jerseyColor', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Blue">Blue</option>
                        <option value="Green">Green</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="class">Class *</Label>
                      <select
                        id="class"
                        value={formData.class}
                        onChange={(e) => handleInputChange('class', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.class ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">Select class</option>
                        <option value="6">Class 6</option>
                        <option value="7">Class 7</option>
                        <option value="8">Class 8</option>
                        <option value="9">Class 9</option>
                        <option value="10">Class 10</option>
                      </select>
                      {errors.class && <p className="text-red-500 text-sm mt-1">{errors.class}</p>}
                    </div>

                    <div>
                      <Label htmlFor="section">Section *</Label>
                      <select
                        id="section"
                        value={formData.section}
                        onChange={(e) => handleInputChange('section', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.section ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">Select section</option>
                        <option value="Alpha">Alpha</option>
                        <option value="Omega">Omega</option>
                        <option value="Sigma">Sigma</option>
                        <option value="Delta">Delta</option>
                      </select>
                      {errors.section && <p className="text-red-500 text-sm mt-1">{errors.section}</p>}
                    </div>

                    <div>
                      <Label htmlFor="mobileNumber">Mobile Number *</Label>
                      <Input
                        id="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                        placeholder="+880 1XXX-XXXXXX"
                        className={errors.mobileNumber ? 'border-red-500' : ''}
                      />
                      {errors.mobileNumber && <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>}
                    </div>

                    <div>
                      <Label htmlFor="size">Jersey Size *</Label>
                      <select
                        id="size"
                        value={formData.size}
                        onChange={(e) => handleInputChange('size', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="S">Small (S)</option>
                        <option value="M">Medium (M)</option>
                        <option value="L">Large (L)</option>
                        <option value="XL">Extra Large (XL)</option>
                        <option value="XXL">Double Extra Large (XXL)</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Select Payment Method</h3>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button
                        type="button"
                        onClick={() => setPaymentMethod('bkash')}
                        variant={paymentMethod === 'bkash' ? 'default' : 'outline'}
                        className="flex-1 w-full sm:w-auto"
                      >
                        Advance Payment via Bkash
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                        className="flex-1 w-full sm:w-auto"
                      >
                        Advance Payment via Cash
                      </Button>
                    </div>
                    {errors.paymentMethod && <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>}

                    {paymentMethod === 'bkash' && (
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="text-md font-semibold mb-4">bKash Payment Details</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">Jersey Price: 300 TK</p>
                              <p className="text-sm text-gray-600">Advance Payment: 300 TK</p>
                            </div>
                            <img src="/bkash-logo.png" alt="bKash" className="h-12" />
                          </div>

                          <div>
                            <p className="font-medium mb-2">bKash Number: +880 1891-979095</p>
                            <p className="text-sm text-gray-600">Please send 300 TK to the above number and provide the transaction details below.</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="trxId">Transaction ID *</Label>
                              <Input
                                id="trxId"
                                value={formData.trxId}
                                onChange={(e) => handleInputChange('trxId', e.target.value)}
                                placeholder="Enter transaction ID"
                                className={errors.trxId ? 'border-red-500' : ''}
                              />
                              {errors.trxId && <p className="text-red-500 text-sm mt-1">{errors.trxId}</p>}
                            </div>

                            <div>
                              <Label htmlFor="paymentNumber">Payment From Number *</Label>
                              <Input
                                id="paymentNumber"
                                value={formData.paymentNumber}
                                onChange={(e) => handleInputChange('paymentNumber', e.target.value)}
                                placeholder="Your bKash number"
                                className={errors.paymentNumber ? 'border-red-500' : ''}
                              />
                              {errors.paymentNumber && <p className="text-red-500 text-sm mt-1">{errors.paymentNumber}</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'cash' && (
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="text-md font-semibold mb-4">Cash Payment Details</h4>
                        <div className="space-y-4">
                          <div>
                            <p className="font-semibold">Advance Payment Amount: 300 TK</p>
                            <p className="text-sm text-gray-600">Please pay 300 TK in cash at the selected location.</p>
                          </div>

                          <div>
                            <Label htmlFor="location">Payment Location *</Label>
                            <select
                              id="location"
                              value={formData.location}
                              onChange={(e) => handleInputChange('location', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                            >
                              <option value="">Select location</option>
                              <option value="School">School</option>
                              <option value="Mosque">Mosque</option>
                              <option value="Other">Other</option>
                            </select>
                            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                          </div>

                          {formData.location === 'Other' && (
                            <div>
                              <Label htmlFor="customLocation">Custom Location *</Label>
                              <Input
                                id="customLocation"
                                value={formData.customLocation}
                                onChange={(e) => handleInputChange('customLocation', e.target.value)}
                                placeholder="Enter custom location"
                                className={errors.customLocation ? 'border-red-500' : ''}
                              />
                              {errors.customLocation && <p className="text-red-500 text-sm mt-1">{errors.customLocation}</p>}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Order'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Information */}
        <section className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">Contact Us</h2>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 lg:gap-8">
            <a
              href="https://www.facebook.com/mahtafgfx1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Facebook className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="font-medium text-sm sm:text-base">Facebook</span>
            </a>

            <a
              href="https://wa.me/8801891979095"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-green-600 hover:text-green-800 transition-colors"
            >
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="font-medium text-sm sm:text-base">WhatsApp</span>
            </a>

            <a
              href="tel:+8801891979095"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="font-medium text-sm sm:text-base">+880 1891-979095</span>
            </a>
          </div>

          <div className="mt-6">
            <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100">
                  Report an Error
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Report an Error</h3>
                  <form onSubmit={handleReportSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="reportName">Name</Label>
                      <Input
                        id="reportName"
                        value={reportFormData.name}
                        onChange={(e) => setReportFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="reportEmail">Email</Label>
                      <Input
                        id="reportEmail"
                        type="email"
                        value={reportFormData.email}
                        onChange={(e) => setReportFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="reportDescription">Error Description</Label>
                      <textarea
                        id="reportDescription"
                        value={reportFormData.description}
                        onChange={(e) => setReportFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the error you encountered..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isReporting}>
                      {isReporting ? 'Submitting...' : 'Submit Report'}
                    </Button>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">© 2025 Badda Alatunnessa Higher Secondary School Jersey Collection. Organized by Mahtaf Hossain.</p>
        </div>
      </footer>
    </div>
  )
}
