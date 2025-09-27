import { CheckCircle, Home, Mail } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">
            Thank You for Your Feedback!
          </CardTitle>
          <CardDescription className="text-lg">
            Your response has been successfully submitted
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">What happens next?</h3>
            <ul className="text-sm text-muted-foreground space-y-2 text-left">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Our AI system will analyze your feedback for insights and sentiment</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Your responses will be incorporated into our improvement planning</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>We may follow up with you for additional clarification if needed</span>
              </li>
            </ul>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="mb-4">
              Your feedback is valuable to us and helps improve our services for everyone.
              If you have any additional questions or concerns, please don't hesitate to contact us.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="mailto:support@insighture.com">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground pt-4 border-t">
            Response ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} • 
            Submitted at {new Date().toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
