import { redirect } from "react-router";
import z from 'zod';
import { Route } from './+types/social-complete-page';
import { makeSSRClient } from '~/supa-client';

const paramSchema = z.object({
  provider: z.enum(["google", "kakao"]),
});

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { success, data } = paramSchema.safeParse(params);
  if (!success) {
    return redirect('/auth/login');
  }
  const { provider } = data;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) {
    return redirect('/auth/login');
  }
  const { client, headers } = makeSSRClient(request);
  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) { throw error; }
  return redirect('/', { headers });
};

// export default function SocialCompletePage() {
//   const { provider } = useParams();
  
//   const providerName = provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "Social";

//   return (
//     <div className="flex items-center justify-center min-h-screen p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="space-y-1">
//           <CardTitle className="text-2xl font-bold text-center">Completing sign in</CardTitle>
//           <CardDescription className="text-center">
//             Please wait while we complete your {providerName} sign in
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
//             <p className="mt-2 text-sm text-muted-foreground">Processing...</p>
//           </div>
//           <div className="text-center text-sm">
//             <Link to="/auth/login" className="text-primary hover:underline">
//             <AnimatedGradientText>Sign in with email</AnimatedGradientText>
//             </Link>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
