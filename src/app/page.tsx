'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
    trxId: '',
    paymentNumber: '',
    location: '',
    customLocation: ''
  })

  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'cash' | null>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jerseyImages, setJerseyImages] = useState<JerseyImage[]>([])
  const [loading, setLoading] = useState(true)

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
    setFormData(prev => ({ ...prev, [field]: value }))
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
          trxId: '',
          paymentNumber: '',
          location: '',
          customLocation: ''
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
                      <Label htmlFor="jerseyName">Jersey Name</Label>
                      <Input
                        id="jerseyName"
                        value={formData.jerseyName}
                        onChange={(e) => handleInputChange('jerseyName', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="class">Class *</Label>
                      <Select value={formData.class} onValueChange={(value) => handleInputChange('class', value)}>
                        <SelectTrigger className={errors.class ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">Class 6</SelectItem>
                          <SelectItem value="7">Class 7</SelectItem>
                          <SelectItem value="8">Class 8</SelectItem>
                          <SelectItem value="9">Class 9</SelectItem>
                          <SelectItem value="10">Class 10</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.class && <p className="text-red-500 text-sm mt-1">{errors.class}</p>}
                    </div>

                    <div>
                      <Label htmlFor="section">Section *</Label>
                      <Select value={formData.section} onValueChange={(value) => handleInputChange('section', value)}>
                        <SelectTrigger className={errors.section ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Alpha">Alpha</SelectItem>
                          <SelectItem value="Beta">Beta</SelectItem>
                          <SelectItem value="Gamma">Gamma</SelectItem>
                          <SelectItem value="Delta">Delta</SelectItem>
                        </SelectContent>
                      </Select>
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
                              <p className="font-semibold">Jersey Price: 295 TK</p>
                              <p className="text-sm text-gray-600">Advance Payment: 150 TK</p>
                            </div>
                            <img src="/bkash-logo.png" alt="bKash" className="h-12" />
                          </div>

                          <div>
                            <p className="font-medium mb-2">bKash Number: +880 1891-979095</p>
                            <p className="text-sm text-gray-600">Please send 150 TK to the above number and provide the transaction details below.</p>
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
                            <p className="font-semibold">Advance Payment Amount: 150 TK</p>
                            <p className="text-sm text-gray-600">Please pay 150 TK in cash at the selected location.</p>
                          </div>

                          <div>
                            <Label htmlFor="location">Payment Location *</Label>
                            <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                              <SelectTrigger className={errors.location ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="School">School</SelectItem>
                                <SelectItem value="Mosque">Mosque</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
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
