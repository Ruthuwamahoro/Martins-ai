// import { useState } from "react"
// import { ApplicationsView } from "@/components/ApplicationsView"
// import { ApplicationWorkspace } from "@/components/ApplicationWorkspace"
// import { Discover } from "@/components/Discover"
// import { Header, type View } from "@/components/Header"
// import { PeopleView } from "@/components/PeopleView"
// import { ProfileView } from "@/components/ProfileView"
// import { Today } from "@/components/Today"
// import { WritingView } from "@/components/WritingView"
// import type { WorkspaceStep } from "@/lib/types"
// import { useApp } from "@/state"

// interface Nav {
//   view: View
//   appId?: string
//   step?: WorkspaceStep
//   essayId?: string
//   discoverTab?: "all" | "new" | "saved"
// }

// export default function App() {
//   const [nav, setNav] = useState<Nav>({ view: "today" })
//   const { apps } = useApp()
//   const activeCount = Object.values(apps).filter((a) => a.status === "drafting").length

//   const go = (view: View, extra: Omit<Nav, "view"> = {}) => setNav({ view, ...extra })
//   const openApp = (appId: string, step?: WorkspaceStep) => go("applications", { appId, step })

//   return (
//     <div className="min-h-screen">
//       <Header view={nav.view} setView={(v) => go(v)} activeCount={activeCount} />
//       <main>
//         {nav.view === "applications" && nav.appId ? (
//           <ApplicationWorkspace
//             key={nav.appId + (nav.step ?? "")}
//             id={nav.appId}
//             initialStep={nav.step}
//             onBack={() => go("applications")}
//             onOpenWriting={(essayId) => go("writing", { essayId })}
//             onOpenPeople={() => go("people")}
//           />
//         ) : nav.view === "today" ? (
//           <Today onOpenApp={openApp} onDiscover={(tab) => go("discover", { discoverTab: tab })} onPeople={() => go("people")} />
//         ) : nav.view === "discover" ? (
//           <Discover key={nav.discoverTab} initialTab={nav.discoverTab} onApply={(id) => openApp(id)} />
//         ) : nav.view === "applications" ? (
//           <ApplicationsView onOpen={openApp} onDiscover={() => go("discover")} />
//         ) : nav.view === "writing" ? (
//           <WritingView key={nav.essayId ?? "list"} initialEssayId={nav.essayId} />
//         ) : nav.view === "people" ? (
//           <PeopleView />
//         ) : (
//           <ProfileView onSaved={() => go("discover")} />
//         )}
//       </main>
//     </div>
//   )
// }
import { useState } from "react"
import { ApplicationsView } from "@/components/ApplicationsView"
import { ApplicationWorkspace } from "@/components/ApplicationWorkspace"
import { Discover } from "@/components/Discover"
import { Header, type View } from "@/components/Header"
import { PeopleView } from "@/components/PeopleView"
import { ProfileView } from "@/components/ProfileView"
import { Today } from "@/components/Today"
import { WritingView } from "@/components/WritingView"
import type { WorkspaceStep } from "@/lib/types"
import { useApp } from "@/state"
import { Landing } from "./components/Landing"

interface Nav {
  view: View
  appId?: string
  step?: WorkspaceStep
  essayId?: string
  discoverTab?: "all" | "new" | "saved"
}

const ENTERED_KEY = "Martins AI:entered"

// First-time visitors see the landing page. After they enter once, we send them
// straight to their work. Visit  /#welcome  to see the landing page again.
function hasEntered() {
  try {
    if (window.location.hash === "#welcome") return false
    return localStorage.getItem(ENTERED_KEY) === "1"
  } catch {
    return false
  }
}

export default function App() {
  const [entered, setEntered] = useState(hasEntered)
  const [nav, setNav] = useState<Nav>({ view: "today" })
  const { apps } = useApp()

  if (!entered) {
    return (
      <Landing
        onEnter={() => {
          try {
            localStorage.setItem(ENTERED_KEY, "1")
          } catch {
            /* fine: they'll just see the landing page again next time */
          }
          if (window.location.hash === "#welcome") history.replaceState(null, "", window.location.pathname)
          window.scrollTo({ top: 0 })
          setEntered(true)
        }}
      />
    )
  }

  const activeCount = Object.values(apps).filter((a) => a.status === "drafting").length
  const go = (view: View, extra: Omit<Nav, "view"> = {}) => setNav({ view, ...extra })
  const openApp = (appId: string, step?: WorkspaceStep) => go("applications", { appId, step })

  return (
    <div className="min-h-screen">
      <Header view={nav.view} setView={(v) => go(v)} activeCount={activeCount} />
      <main>
        {nav.view === "applications" && nav.appId ? (
          <ApplicationWorkspace
            key={nav.appId + (nav.step ?? "")}
            id={nav.appId}
            initialStep={nav.step}
            onBack={() => go("applications")}
            onOpenWriting={(essayId) => go("writing", { essayId })}
            onOpenPeople={() => go("people")}
          />
        ) : nav.view === "today" ? (
          <Today onOpenApp={openApp} onDiscover={(tab) => go("discover", { discoverTab: tab })} onPeople={() => go("people")} />
        ) : nav.view === "discover" ? (
          <Discover key={nav.discoverTab} initialTab={nav.discoverTab} onApply={(id) => openApp(id)} />
        ) : nav.view === "applications" ? (
          <ApplicationsView onOpen={openApp} onDiscover={() => go("discover")} />
        ) : nav.view === "writing" ? (
          <WritingView key={nav.essayId ?? "list"} initialEssayId={nav.essayId} />
        ) : nav.view === "people" ? (
          <PeopleView />
        ) : (
          <ProfileView onSaved={() => go("discover")} />
        )}
      </main>
    </div>
  )
}