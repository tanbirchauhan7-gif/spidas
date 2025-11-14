import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Unlock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CryptoJS from "crypto-js";

const AESDemo = () => {
  const [plaintext, setPlaintext] = useState("");
  const [encryptedText, setEncryptedText] = useState("");
  const [decryptedText, setDecryptedText] = useState("");
  const [key] = useState("SPIDAS2024SECRET"); // Fixed key for demo
  const { toast } = useToast();

  const handleEncrypt = () => {
    if (!plaintext) {
      toast({
        title: "Error",
        description: "Please enter text to encrypt",
        variant: "destructive",
      });
      return;
    }

    const encrypted = CryptoJS.AES.encrypt(plaintext, key).toString();
    setEncryptedText(encrypted);
    toast({
      title: "Encryption Successful",
      description: "Text has been encrypted using AES-128",
    });
  };

  const handleDecrypt = () => {
    if (!encryptedText) {
      toast({
        title: "Error",
        description: "No encrypted text to decrypt",
        variant: "destructive",
      });
      return;
    }

    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedText, key).toString(CryptoJS.enc.Utf8);
      setDecryptedText(decrypted);
      toast({
        title: "Decryption Successful",
        description: "Text has been decrypted successfully",
      });
    } catch (error) {
      toast({
        title: "Decryption Failed",
        description: "Invalid encrypted text or key",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            AES Encryption Demo
          </h1>
          <p className="text-xl text-muted-foreground">
            Experience 128-bit AES encryption used in SPIDAS for secure communication
          </p>
        </div>

        {/* Key Display */}
        <Card className="p-6 mb-8 bg-gradient-card">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm text-muted-foreground">Encryption Key</Label>
              <p className="text-lg font-mono font-bold text-primary">{key}</p>
            </div>
            <Lock className="w-8 h-8 text-primary" />
          </div>
        </Card>

        {/* Encryption Section */}
        <Card className="p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Encrypt Message</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="plaintext">Plain Text</Label>
              <Input
                id="plaintext"
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
                placeholder="Enter message to encrypt (e.g., INTRUSION_DETECTED)"
                className="mt-2"
              />
            </div>

            <Button onClick={handleEncrypt} className="w-full">
              <Lock className="w-4 h-4 mr-2" />
              Encrypt Message
            </Button>

            {encryptedText && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <Label className="text-sm text-muted-foreground">Encrypted Output</Label>
                <p className="font-mono text-sm mt-2 break-all text-foreground">{encryptedText}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Flow Arrow */}
        {encryptedText && (
          <div className="flex justify-center mb-6">
            <ArrowRight className="w-8 h-8 text-primary animate-pulse" />
          </div>
        )}

        {/* Decryption Section */}
        {encryptedText && (
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Unlock className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">Decrypt Message</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Encrypted Text</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="font-mono text-sm break-all text-foreground">{encryptedText}</p>
                </div>
              </div>

              <Button onClick={handleDecrypt} variant="secondary" className="w-full">
                <Unlock className="w-4 h-4 mr-2" />
                Decrypt Message
              </Button>

              {decryptedText && (
                <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-lg">
                  <Label className="text-sm text-success">Decrypted Output</Label>
                  <p className="font-mono text-lg mt-2 text-success font-bold">{decryptedText}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Info Section */}
        <Card className="p-6 mt-8">
          <h3 className="text-xl font-semibold mb-4">How SPIDAS Uses AES</h3>
          <div className="space-y-2 text-muted-foreground">
            <p>• <strong className="text-foreground">Arduino Encryption:</strong> Alert messages are encrypted before Bluetooth transmission</p>
            <p>• <strong className="text-foreground">Secure Channel:</strong> Even if intercepted, data remains unreadable</p>
            <p>• <strong className="text-foreground">Key Management:</strong> Encryption key stored securely on both devices</p>
            <p>• <strong className="text-foreground">Performance:</strong> Fast encryption with minimal latency</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AESDemo;
