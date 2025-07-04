import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { sendPasswordResetEmail, getAuth } from "firebase/auth";
import bcrypt from "bcryptjs";

interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userDoc, setUserDoc] = useState<any>(null);
  const { toast } = useToast();
  const auth = getAuth();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Checking email:", email);
      
      // Check if email exists in users collection
      const usersQuery = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(usersQuery);

      if (querySnapshot.empty) {
        toast({
          title: "Email not found",
          description: "No account found with this email address.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const userDocument = querySnapshot.docs[0];
      const userData = userDocument.data();
      
      console.log("User data:", userData);
      
      // Check if security questions exist (new structure)
      if (!userData.securityQuestions || !userData.securityQuestions.question1 || !userData.securityQuestions.answer1) {
        toast({
          title: "Security question not set",
          description: "This account doesn't have a security question set up.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Use the first security question
      setSecurityQuestion(userData.securityQuestions.question1);
      setUserDoc({ id: userDocument.id, ...userData });
      setStep(2);
      
      toast({
        title: "Email verified! 📩",
        description: "Please answer your security question to continue.",
      });
    } catch (error: any) {
      console.error("Email verification error:", error);
      toast({
        title: "Error",
        description: "Failed to verify email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if the answer matches (case-insensitive) - using the first security question answer
      const correctAnswer = userDoc.securityQuestions.answer1;
      const answerMatch = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();

      console.log("User answer:", userAnswer.toLowerCase().trim());
      console.log("Correct answer:", correctAnswer.toLowerCase().trim());
      console.log("Match:", answerMatch);

      if (answerMatch) {
        setStep(3);
        toast({
          title: "Security question verified! 🔐",
          description: "Great! Now set your new password.",
        });
      } else {
        toast({
          title: "Incorrect answer",
          description: "The answer doesn't match our records. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Security question verification error:", error);
      toast({
        title: "Error",
        description: "Failed to verify security question.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Send Firebase password reset email
      await sendPasswordResetEmail(auth, email);
      
      // Hash the new password for Firestore backup
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Update password in Firestore as backup
      const userRef = doc(db, "users", userDoc.id);
      await updateDoc(userRef, {
        password: hashedPassword,
        lastPasswordUpdate: new Date().toISOString(),
        passwordResetAt: new Date().toISOString()
      });
      
      setStep(4);
      
      toast({
        title: "Password reset email sent! 📝",
        description: "Check your email and use the link to reset your password.",
      });
      
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Failed to send reset email",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setStep(1);
    setEmail("");
    setUserAnswer("");
    setNewPassword("");
    setConfirmPassword("");
    setSecurityQuestion("");
    setUserDoc(null);
    onBack();
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Step 1: Enter Your Registered Email";
      case 2: return "Step 2: Answer Your Secret Question";
      case 3: return "Step 3: Reset Your Password";
      case 4: return "Step 4: Login With Your New Password";
      default: return "Forgot Password";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return "📩 Please enter the email linked to your account. (We'll check if you're in our cozy little database!)";
      case 2: return "🔐 Let's make sure it's really you! Answer the security question you chose when signing up.";
      case 3: return "📝 Yay! You've been verified. Now, go ahead and set a new password you'll remember (or at least love). 💡 Tip: Choose something strong, sweet, and secure!";
      case 4: return "🎉 All done! Check your email for the password reset link, then return to login with your new password.";
      default: return "";
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {getStepTitle()}
        </CardTitle>
        <CardDescription className="text-center">
          {getStepDescription()}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                Back to Login
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Verifying..." : "Continue"}
              </Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSecurityQuestionSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-medium">{securityQuestion}</Label>
              <Input
                type="text"
                placeholder="Your answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Verifying..." : "Continue"}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Sending Reset Email..." : "Reset Password"}
              </Button>
            </div>
          </form>
        )}

        {step === 4 && (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 font-medium">Password reset email sent successfully!</p>
              <p className="text-green-600 text-sm mt-2">
                Check your inbox and click the reset link to complete the process.
              </p>
            </div>
            <Button onClick={handleBackToLogin} className="w-full">
              Back to Login
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ForgotPassword;
