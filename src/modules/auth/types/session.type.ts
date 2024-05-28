export type SessionParam = {
    userId: number
    firstName: string
    lastName: string
}

export type UserSession = SessionParam & {
    token: string
}
