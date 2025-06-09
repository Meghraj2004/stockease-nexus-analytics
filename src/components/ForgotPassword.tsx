
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: Security Questions, 3: Reset Sent
  const [securityQuestions, setSecurityQuestions] = useState<any>(null);
  const [answers, setAnswers] = useState({ answer1: "", answer2: "", answer3: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
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

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      if (!userData.securityQuestions) {
        toast({
          title: "Security questions not set",
          description: "This account doesn't have security questions set up.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setSecurityQuestions(userData.securityQuestions);
      setUserId(userDoc.id);
      setStep(2);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to verify email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityQuestionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const answer1Match = answers.answer1.toLowerCase().trim() === securityQuestions.answer1;
      const answer2Match = answers.answer2.toLowerCase().trim() === securityQuestions.answer2;
      const answer3Match = answers.answer3.toLowerCase().trim() === securityQuestions.answer3;

      if (answer1Match && answer2Match && answer3Match) {
        // Send password reset email using Firebase Auth
        await sendPasswordResetEmail(auth, email);
        
        setStep(3);
        toast({
          title: "Password reset email sent",
          description: "Check your email for password reset instructions.",
        });
      } else {
        toast({
          title: "Incorrect answers",
          description: "One or more security question answers are incorrect.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to send password reset email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // Reset form and go back to login
    setStep(1);
    setEmail("");
    setAnswers({ answer1: "", answer2: "", answer3: "" });
    onBack();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {step === 1 && "Forgot Password"}
          {step === 2 && "Security Questions"}
          {step === 3 && "Reset Email Sent"}
        </CardTitle>
        <CardDescription className="text-center">
          {step === 1 && "Enter your email to start password recovery"}
          {step === 2 && "Answer your security questions"}
          {step === 3 && "Check your email for password reset instructions"}
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

        {step === 2 && securityQuestions && (
          <form onSubmit={handleSecurityQuestionsSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{securityQuestions.question1}</Label>
              <Input
                type="text"
                placeholder="Your answer"
                value={answers.answer1}
                onChange={(e) => setAnswers({ ...answers, answer1: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{securityQuestions.question2}</Label>
              <Input
                type="text"
                placeholder="Your answer"
                value={answers.answer2}
                onChange={(e) => setAnswers({ ...answers, answer2: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{securityQuestions.question3}</Label>
              <Input
                type="text"
                placeholder="Your answer"
                value={answers.answer3}
                onChange={(e) => setAnswers({ ...answers, answer3: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Verifying..." : "Verify Answers"}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-700 font-medium">Password reset email sent!</p>
              <p className="text-green-600 text-sm mt-1">
                Check your email ({email}) for instructions to reset your password.
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
