import * as SQLite from 'expo-sqlite'

export const test_db = SQLite.openDatabaseSync('test.db')