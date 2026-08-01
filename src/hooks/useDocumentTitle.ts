import { useEffect } from 'react'

export default function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    if (title) {
      document.title = `${title} — Streamiq`
    } else {
      document.title = 'Streamiq — Watch Movies & TV Series'
    }
  }, [title])
}
