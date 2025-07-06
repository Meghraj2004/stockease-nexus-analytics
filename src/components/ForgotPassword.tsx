
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Shield, Key, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";

interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [securityAnswer1, setSecurityAnswer1] = useState("");
  const [securityAnswer2, setSecurityAnswer2] = useState("");
  const [securityAnswer3, setSecurityAnswer3] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userDoc, setUserDoc] = useState<any>(null);
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          title: "Email not found",
          description: "No account found with this email address.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const userData = querySnapshot.docs[0];
      setUserDoc({ id: userData.id, ...userData.data() });
      
      toast({
        title: "Email verified!",
        description: "Account found. Please answer your security questions.",
      });
      
      setStep(2);
    } catch (error) {
      console.error("Error checking email:", error);
      toast({
        title: "Error",
        description: "Failed to verify email. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleSecurityAnswers = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const securityQuestions = userDoc.securityQuestions;
      
      if (!securityQuestions || !securityQuestions.answer1 || !securityQuestions.answer2 || !securityQuestions.answer3) {
        toast({
          title: "Security questions not found",
          description: "No security questions found for this account.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Check all three security answers
      const isAnswer1Correct = await bcrypt.compare(securityAnswer1.toLowerCase().trim(), securityQuestions.answer1);
      const isAnswer2Correct = await bcrypt.compare(securityAnswer2.toLowerCase().trim(), securityQuestions.answer2);
      const isAnswer3Correct = await bcrypt.compare(securityAnswer3.toLowerCase().trim(), securityQuestions.answer3);
      
      if (!isAnswer1Correct || !isAnswer2Correct || !isAnswer3Correct) {
        toast({
          title: "Incorrect answers",
          description: "One or more security answers are incorrect. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Security questions verified!",
        description: "You can now set a new password.",
      });
      
      setStep(3);
    } catch (error) {
      console.error("Error verifying security answers:", error);
      toast({
        title: "Error",
        description: "Failed to verify security answers. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
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
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await updateDoc(doc(db, "users", userDoc.id), {
        password: hashedPassword,
        lastPasswordUpdate: new Date(),
        passwordResetAt: new Date()
      });

      toast({
        title: "Password updated successfully!",
        description: "You can now login with your new password.",
      });
      
      setStep(4);
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const getStepIcon = () => {
    switch (step) {
      case 1: return <Mail className="h-6 w-6" />;
      case 2: return <Shield className="h-6 w-6" />;
      case 3: return <Key className="h-6 w-6" />;
      case 4: return <CheckCircle className="h-6 w-6" />;
      default: return <Mail className="h-6 w-6" />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Enter Your Registered Email";
      case 2: return "Answer Your Security Questions";
      case 3: return "Set a New Password";
      case 4: return "Password Reset Complete";
      default: return "Reset Password";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return "We'll check if your account exists in our database.";
      case 2: return "Please answer all three security questions to verify your identity.";
      case 3: return "Create a new password for your account.";
      case 4: return "Your new password is now your current password.";
      default: return "";
    }
  };

  return (
    <Card className="shadow-xl shadow-blue-900/5 backdrop-blur-sm bg-white/95 border-stockease-200">
      <CardHeader className="space-y-1 flex flex-col items-center pb-2">
        <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-stockease-600 to-stockease-400 p-3 mb-4 shadow-lg shadow-stockease-400/30">
          {getStepIcon()}
        </div>
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-br from-stockease-800 to-stockease-600 bg-clip-text text-transparent">
          {getStepTitle()}
        </CardTitle>
        <CardDescription className="text-center text-stockease-700/70 font-medium">
          {getStepDescription()}
        </CardDescription>
        
        {/* Step indicator */}
        <div className="flex items-center space-x-2 mt-4">
          {[1, 2, 3, 4].map((stepNum) => (
            <div
              key={stepNum}
              className={`w-2 h-2 rounded-full transition-colors ${
                stepNum <= step ? 'bg-stockease-600' : 'bg-stockease-200'
              }`}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-4 max-h-96 overflow-y-auto">
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-stockease-700 font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-stockease-50/50 border-stockease-200 focus:border-stockease-400"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-stockease-600 to-stockease-500 hover:from-stockease-700 hover:to-stockease-600" 
              disabled={isLoading}
            >
              {isLoading ? "Checking..." : "Check Email"}
            </Button>
          </form>
        )}

        {step === 2 && userDoc && (
          <form onSubmit={handleSecurityAnswers} className="space-y-4">
            {/* Security Question 1 */}
            <div className="space-y-2">
              <Label className="text-stockease-700 font-medium">Security Question 1</Label>
              <p className="text-sm text-stockease-600 bg-stockease-50 p-3 rounded-md border border-stockease-200">
                {userDoc.securityQuestions?.question1}
              </p>
              <Input
                type="text"
                placeholder="Your answer"
                value={securityAnswer1}
                onChange={(e) => setSecurityAnswer1(e.target.value)}
                className="bg-stockease-50/50 border-stockease-200 focus:border-stockease-400"
                required
              />
            </div>

            {/* Security Question 2 */}
            <div className="space-y-2">
              <Label className="text-stockease-700 font-medium">Security Question 2</Label>
              <p className="text-sm text-stockease-600 bg-stockease-50 p-3 rounded-md border border-stockease-200">
                {userDoc.securityQuestions?.question2}
              </p>
              <Input
                type="text"
                placeholder="Your answer"
                value={securityAnswer2}
                onChange={(e) => setSecurityAnswer2(e.target.value)}
                className="bg-stockease-50/50 border-stockease-200 focus:border-stockease-400"
                required
              />
            </div>

            {/* Security Question 3 */}
            <div className="space-y-2">
              <Label className="text-stockease-700 font-medium">Security Question 3</Label>
              <p className="text-sm text-stockease-600 bg-stockease-50 p-3 rounded-md border border-stockease-200">
                {userDoc.securityQuestions?.question3}
              </p>
              <Input
                type="text"
                placeholder="Your answer"
                value={securityAnswer3}
                onChange={(e) => setSecurityAnswer3(e.target.value)}
                className="bg-stockease-50/50 border-stockease-200 focus:border-stockease-400"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-stockease-600 to-stockease-500 hover:from-stockease-700 hover:to-stockease-600" 
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify Answers"}
            </Button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-stockease-700 font-medium">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-stockease-50/50 border-stockease-200 focus:border-stockease-400"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-stockease-700 font-medium">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-stockease-50/50 border-stockease-200 focus:border-stockease-400"
                required
                minLength={6}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-stockease-600 to-stockease-500 hover:from-stockease-700 hover:to-stockease-600" 
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        )}

        {step === 4 && (
          <div className="text-center space-y-4">
            <div className="text-green-600 text-lg font-medium">
              Password successfully updated!
            </div>
            <p className="text-stockease-600">
              You can now login with your new password.
            </p>
            <Button 
              onClick={onBack}
              className="w-full bg-gradient-to-r from-stockease-600 to-stockease-500 hover:from-stockease-700 hover:to-stockease-600"
            >
              Back to Login
            </Button>
          </div>
        )}

        {step < 4 && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="w-full text-stockease-600 hover:text-stockease-700 hover:bg-stockease-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ForgotPassword;
