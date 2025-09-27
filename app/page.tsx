'use client'

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, 
  BarChart3, 
  Zap, 
  Shield, 
  Globe, 
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  TrendingUp,
  MessageSquare,
  Brain,
  Rocket
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const features = [
    {
      icon: <Brain className="h-6 w-6 text-blue-500" />,
      title: "AI-Powered Analysis",
      description: "Advanced sentiment analysis and automatic categorization of feedback responses"
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: "Real-Time Insights",
      description: "Live dashboard with instant updates and notifications for critical feedback"
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-green-500" />,
      title: "Smart Analytics",
      description: "Comprehensive analytics with trends, patterns, and actionable recommendations"
    },
    {
      icon: <Users className="h-6 w-6 text-purple-500" />,
      title: "Multi-Project Support",
      description: "Organize and manage feedback across multiple client projects seamlessly"
    },
    {
      icon: <Globe className="h-6 w-6 text-indigo-500" />,
      title: "Public Forms",
      description: "Beautiful, responsive feedback forms that work perfectly on any device"
    },
    {
      icon: <Shield className="h-6 w-6 text-red-500" />,
      title: "Enterprise Security",
      description: "Secure authentication, data encryption, and GDPR-compliant architecture"
    }
  ]

  const stats = [
    { label: "Response Analysis Time", value: "< 5 sec", icon: <Zap className="h-4 w-4" /> },
    { label: "AI Accuracy", value: "95%+", icon: <Brain className="h-4 w-4" /> },
    { label: "Real-time Updates", value: "< 1 sec", icon: <TrendingUp className="h-4 w-4" /> },
    { label: "Supported Projects", value: "Unlimited", icon: <Users className="h-4 w-4" /> }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-50"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Feedback Platform
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Collect, Analyze & Act on
              <span className="block text-primary">Feedback Intelligently</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Transform how you gather and understand customer feedback with AI-powered insights, 
              real-time analytics, and beautiful forms that your users will love to fill out.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild className="text-lg px-8 py-3">
              <Link href="/auth/login">
                <Rocket className="h-5 w-5 mr-2" />
                Get Started Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-3">
              <Link href="/feedback/demo-survey">
                <MessageSquare className="h-5 w-5 mr-2" />
                Try Demo Survey
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need for modern feedback collection
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for teams who want to make data-driven decisions with intelligent feedback analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {feature.icon}
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Simple workflow, powerful results
            </h2>
            <p className="text-xl text-muted-foreground">
              Get started in minutes, not hours
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Your Survey</h3>
              <p className="text-muted-foreground">
                Use our AI-assisted builder to create beautiful surveys in minutes. 
                Choose from templates or build from scratch.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Collect Responses</h3>
              <p className="text-muted-foreground">
                Share your survey link and watch responses come in. 
                Real-time AI analysis provides instant insights.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Analyze & Act</h3>
              <p className="text-muted-foreground">
                Get AI-powered insights, sentiment analysis, and actionable recommendations 
                to improve your products and services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            Ready to transform your feedback process?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join teams who are already using AI to understand their customers better
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-3">
              <Link href="/auth/login">
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8 text-primary-foreground/80">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Setup in 5 minutes</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FeedbackGenie</span>
          </div>
          <p className="text-gray-400 mb-6">
            AI-powered feedback collection and analysis platform
          </p>
          <div className="text-sm text-gray-500">
            © 2024 FeedbackGenie. Built with ❤️ for better feedback experiences.
          </div>
        </div>
      </footer>
    </div>
  )
}
