"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Download, Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface QRCodeDisplayProps {
  surveySlug: string;
  surveyName: string;
  size?: number;
  showDialog?: boolean;
}

export default function QRCodeDisplay({
  surveySlug,
  surveyName,
  size = 200,
  showDialog = true,
}: QRCodeDisplayProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate the survey URL
  const surveyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/survey/${surveySlug}`;

  // Generate QR code
  useEffect(() => {
    const generateQRCode = async () => {
      if (!surveySlug) return;

      try {
        setIsGenerating(true);
        const dataUrl = await QRCode.toDataURL(surveyUrl, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrCodeDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
        toast.error('Failed to generate QR code');
      } finally {
        setIsGenerating(false);
      }
    };

    generateQRCode();
  }, [surveySlug, surveyUrl, size]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(surveyUrl);
      setCopied(true);
      toast.success('Survey URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = `${surveySlug}-qr-code.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: surveyName,
          text: `Take this survey: ${surveyName}`,
          url: surveyUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        handleCopyUrl();
      }
    } else {
      // Fallback to copy URL
      handleCopyUrl();
    }
  };

  const QRCodeContent = () => (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col items-center p-6">
          {isGenerating ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Generating QR code...</p>
            </div>
          ) : qrCodeDataUrl ? (
            <img
              src={qrCodeDataUrl}
              alt={`QR code for ${surveyName}`}
              className="rounded-lg"
              width={size}
              height={size}
            />
          ) : (
            <div className="flex items-center justify-center w-48 h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <p className="text-sm text-muted-foreground">Failed to generate QR code</p>
            </div>
          )}

          <div className="text-center mt-4">
            <p className="font-medium">{surveyName}</p>
            <p className="text-sm text-muted-foreground break-all">{surveyUrl}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        <Button onClick={handleCopyUrl} variant="outline" className="w-full">
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          {copied ? 'Copied!' : 'Copy Survey URL'}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleDownloadQR} variant="outline" disabled={!qrCodeDataUrl}>
            <Download className="h-4 w-4 mr-2" />
            Download QR
          </Button>
          <Button onClick={handleShare} variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );

  if (!showDialog) {
    return <QRCodeContent />;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="h-4 w-4 mr-2" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Survey QR Code</DialogTitle>
          <DialogDescription>
            Share this QR code or URL to let people access your survey
          </DialogDescription>
        </DialogHeader>
        <QRCodeContent />
      </DialogContent>
    </Dialog>
  );
}