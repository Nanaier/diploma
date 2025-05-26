// // // client/src/middleware.ts
// // import { NextRequest, NextResponse } from "next/server";

// // export function middleware(req: NextRequest) {
// //   const token = req.cookies.get("token")?.value;

// //   const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

// //   // If logged in and accessing auth pages → redirect to dashboard
// //   if (isAuthPage && token) {
// //     return NextResponse.redirect(new URL("/dashboard", req.url));
// //   }

// //   // If NOT logged in and accessing protected route → redirect to login
// //   if (!isAuthPage && req.nextUrl.pathname.startsWith("/dashboard") && !token) {
// //     return NextResponse.redirect(new URL("/auth/login", req.url));
// //   }

// //   return NextResponse.next();
// // }

// // export const config = {
// //   matcher: ["/auth/:path*", "/dashboard/:path*"],
// // };

// // middleware.ts
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register"];
// const PSYCHOLOGIST_SPECIAL_ROUTES = [
//   "/psychologist/complete-profile",
//   "/psychologist/pending",
// ];

// export async function middleware(request: NextRequest) {
//   const token = request.cookies.get("token")?.value;
//   const path = request.nextUrl.pathname;

//   // Public routes
//   if (PUBLIC_ROUTES.includes(path)) {
//     if (token) {
//       return NextResponse.redirect(new URL("/dashboard", request.url));
//     }
//     return NextResponse.next();
//   }

//   // Protected routes - require token
//   if (!token) {
//     return NextResponse.redirect(new URL("/auth/login", request.url));
//   }

//   // Verify token
//   const verification = await verifyTokenBackend(token);
//   if (!verification.valid) {
//     const response = NextResponse.redirect(new URL("/auth/login", request.url));
//     response.cookies.delete("token");
//     return response;
//   }

//   // Psychologist special routes
//   if (verification.user.role === "psychologist") {
//     if (
//       verification.user.status === "needs_profile" &&
//       !path.startsWith("/psychologist/complete-profile")
//     ) {
//       return NextResponse.redirect(
//         new URL("/psychologist/complete-profile", request.url)
//       );
//     }

//     if (
//       verification.user.status === "pending" &&
//       !path.startsWith("/psychologist/pending") &&
//       !path.startsWith("/psychologist/complete-profile")
//     ) {
//       return NextResponse.redirect(
//         new URL("/psychologist/pending", request.url)
//       );
//     }
//   }

//   return NextResponse.next();
// }

// async function verifyTokenBackend(token: string) {
//   try {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-token`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     return await response.json();
//   } catch (error) {
//     console.error("Token verification failed:", error);
//     return { valid: false };
//   }
// }

// export const config = {
//   matcher: [
//     "/dashboard/:path*",
//     "/psychologist/:path*",
//     "/admin/:path*",
//     "/auth/:path*",
//   ],
// };

// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/register/psychologist",
];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  // Skip middleware for API routes and static files
  if (path.startsWith("/_next/") || path.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Public routes - allow access even with token
  if (PUBLIC_ROUTES.some((route) => path.startsWith(route))) {
    return NextResponse.next();
  }

  // Protected routes - require token
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Verify token
  const verification = await verifyTokenBackend(token);
  if (!verification.valid) {
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  if (verification.valid && path == "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Psychologist status handling
  if (verification.user.role === "psychologist") {
    if (
      verification.user.status === "needs_profile" &&
      !path.startsWith("/psychologist/complete-profile")
    ) {
      return NextResponse.redirect(
        new URL("/psychologist/complete-profile", request.url)
      );
    }

    if (
      verification.user.status === "pending" &&
      !path.startsWith("/psychologist/pending") &&
      !path.startsWith("/psychologist/complete-profile")
    ) {
      return NextResponse.redirect(
        new URL("/psychologist/pending", request.url)
      );
    }

    if (
      verification.user.status === "rejected" &&
      !path.startsWith("/psychologist/rejected")
    ) {
      return NextResponse.redirect(
        new URL("/psychologist/rejected", request.url)
      );
    }
  }

  return NextResponse.next();
}

async function verifyTokenBackend(token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Token verification failed:", error);
    return { valid: false };
  }
}
