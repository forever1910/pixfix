import PocketBase from 'pocketbase'

export const pb = new PocketBase('https://pb.jimshang.com')
pb.autoCancellation(false)
