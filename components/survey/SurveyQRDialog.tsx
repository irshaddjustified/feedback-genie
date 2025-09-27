'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QRCode } from '@/components/ui/qr-code'
import { QrCode, Copy, Download, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface SurveyQRDialogProps {
  surveyId: string
  shareLink: string
  surveyTitle: string
  children?: React.ReactNode
}

export function SurveyQRDialog({ surveyId, shareLink, surveyTitle, children }: SurveyQRDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const surveyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/feedback/${shareLink}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(surveyUrl)
      toast.success('Survey link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const downloadQRCode = () => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.download = `survey-qr-${surveyId}.png`
      link.href = canvas.toDataURL()
      link.click()
      toast.success('QR code downloaded!')
    }
  }

  const openSurvey = () => {
    window.open(surveyUrl, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Survey QR Code</DialogTitle>
          <DialogDescription>
            Share this QR code or link to collect responses for "{surveyTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          {/* QR Code */}
          <div className="bg-white p-4 rounded-lg">
            <QRCode value={surveyUrl} size={200} />
          </div>
          
          {/* Survey URL */}
          <div className="w-full space-y-2">
            <Label htmlFor="survey-url">Survey Link</Label>
            <div className="flex gap-2">
              <Input
                id="survey-url"
                value={surveyUrl}
                readOnly
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={downloadQRCode} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download QR
            </Button>
            <Button variant="outline" onClick={openSurvey} className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Survey
            </Button>
          </div>
          
          {/* Access Instructions */}
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg w-full">
            <p className="font-medium mb-1">Survey Access:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Anonymous access: Anyone can respond</li>
              <li>Google Auth: Optional authentication for tracking</li>
              <li>QR Code: Perfect for mobile access</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SurveyQRDialog
