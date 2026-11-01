// components/LoadingLink.jsx
"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import styles from "./homePage.css"

export default function LoadingLink({ href, children, className }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    return (
        <>
            <Link
                style={{textDecoration : 'none', color : 'black'}}
                href={href}
                className={className}
                onClick={(e) => {
                    e.preventDefault()
                    startTransition(() => router.push(href))
                }}
            >
                {children}
            </Link>

            {isPending && (
                <div className="loading">
                    <p>Yükleniyor...</p>
                </div>
            )}
        </>
    )
}