import { getDatabase, type Database } from 'firebase/database'
import { firebaseApp } from './firebase'
import { isFirebaseConfigured } from './env'

let database: Database | null = null

if (isFirebaseConfigured && firebaseApp) {
  database = getDatabase(firebaseApp)
}

export const firebaseDatabase = database
