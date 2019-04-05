
import MainLayout from 'layouts/default'
import ChatPage from 'pages/Chat'
import SettingsPage from 'pages/Settings'
import CardDeckPage from 'pages/CardDeck'
import CardSuggestionsPage from 'pages/CardSuggestions'
import CardBookmarksPage from 'pages/CardBookmarks'
import ErrorPage from 'pages/Error'

export default [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '/', component: ChatPage, meta: { title: 'Chat with HABot' } },
      { path: '/chat', redirect: '/' },
      { path: '/settings', component: SettingsPage, meta: { title: 'Settings' } },
      { path: '/cards/bookmarks', component: CardBookmarksPage, meta: { title: 'Card bookmarks' } },
      { path: '/cards/suggestions', component: CardSuggestionsPage, meta: { title: 'Card suggestions' } },
      { path: '/cards/recent', component: () => import('pages/CardRecent'), meta: { title: 'Recent cards' } },
      { path: '/cards/deck', component: CardDeckPage, meta: { title: 'Card deck' } },
      { path: '/help', component: () => import('pages/Help'), meta: { title: 'Help' } },
      { path: '/notification',
        redirect: (to) => {
          return { path: '/chat', hash: '', query: '', params: { action: to.hash } }
        }
      }
    ]
  },
  {
    path: '/designer/:uid',
    component: () => import('layouts/designer/CardDesigner'),
    props: true
  },
  {
    path: '/offline',
    component: ErrorPage,
    meta: { reason: 'offline' }
  },
  { path: '/index.html', redirect: '/' },
  { // Always leave this as last one
    path: '*',
    component: ErrorPage
  }
]
