// Minimal pub-sub so any view can open modals / navigate without prop drilling.
let aiHandler = null, wiHandler = null, projHandler = null, palHandler = null
export const onAI = (fn) => { aiHandler = fn }
export const onWhatIf = (fn) => { wiHandler = fn }
export const onProj = (fn) => { projHandler = fn }
export const onPalette = (fn) => { palHandler = fn }
export const openAI = (id) => aiHandler && aiHandler(id)
export const openWhatIf = (id) => wiHandler && wiHandler(id)
export const openProj = (id) => projHandler && projHandler(id)
export const openPalette = () => palHandler && palHandler()
