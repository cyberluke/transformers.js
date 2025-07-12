# ULID Pagination Implementation Guide

Kompletní implementace ULID s paginací pro chaty a zprávy.

## 📦 Potřebné knihovny

```bash
npm install ulid
```

## 🔧 Implementované změny

### 1. **Database Schema** (ULID místo UUID)
- ✅ `lib/db/schema/chats.ts` - ULID ID (26 znaků)
- ✅ `lib/db/schema/messages.ts` - ULID ID a chat_id (26 znaků) 
- ✅ Nové indexy pro optimální ULID paginaci

### 2. **Actions Functions** (nové paginace funkce)
- ✅ `getUserChatsWithPagination()` - Chaty po 10 s Load More
- ✅ `getChatMessagesWithPagination()` - Sjednocená funkce pro zprávy (nejnovější i starší)
- ✅ Odstraněny staré `getUserChats()` a `getChatMessages()` funkce

### 3. **API Endpoints**
- ✅ `/api/chats` - GET endpoint pro paginaci chatů
- ✅ `/api/messages` - GET endpoint pro paginaci zpráv

### 4. **Fingerprint Validation** (sjednocení)
- ✅ `lib/server/fingerprint/auth.ts` - Společná utilita pro fingerprint validaci
- ✅ `validateFingerprint()` - Pro GET endpointy (query parametry)
- ✅ `validateFingerprintFromCustomData()` - Pro POST endpointy (body)
- ✅ Všechny API endpointy používají společnou validaci

## 🚀 API Usage

### **Chaty - Load More Pagination**
```typescript
// První načtení (10 chatů)
GET /api/chats?fingerprint=xxx&limit=10

// Load More (dalších 10)
GET /api/chats?fingerprint=xxx&cursor=CURSOR_VALUE&limit=10

// Response
{
  "success": true,
  "data": {
    "chats": [...],
    "nextCursor": "01HZ1234567890ABCDEF1234", // nebo null
    "hasMore": true
  }
}
```

### **Zprávy - Scroll Up Pagination**
```typescript
// První načtení (nejnovější zprávy)
GET /api/messages?fingerprint=xxx&chatId=xxx&limit=10

// Scroll Up (starší zprávy)
GET /api/messages?fingerprint=xxx&chatId=xxx&cursor=CURSOR_VALUE&limit=10

// Response
{
  "success": true,
  "data": {
    "messages": [...],
    "nextCursor": "01HZ1234567890ABCDEF1234", // nebo null
    "hasMore": true
  }
}
```

## 💡 Výhody ULID

- ✅ **Chronologicky sortable** (jako MongoDB ObjectID)
- ✅ **Lexicographically sortable** - `lt(messages.id, cursor)` funguje
- ✅ **Collision-safe** - žádné duplikáty
- ✅ **Database friendly** - lepší clustering než UUID
- ✅ **Konzistentní paginace** - žádné přeskakování při nových záznamech

## 🔐 Fingerprint Authentication

### **Společná validace**
```typescript
// Pro GET endpointy
import { validateFingerprint } from '@/lib/server/fingerprint/auth';

const { userId, error } = await validateFingerprint(fingerprint);
if (error) return error;

// Pro POST endpointy  
import { validateFingerprintFromCustomData } from '@/lib/server/fingerprint/auth';

const userId = await validateFingerprintFromCustomData(customData);
if (!userId) return new Response('Unauthorized', { status: 401 });
```

### **Výhody sjednocení**
- ✅ **DRY principle** - žádná duplikace kódu
- ✅ **Konzistentní error handling** - stejné chybové zprávy
- ✅ **Centralizovaná logika** - snadné úpravy
- ✅ **Type safety** - TypeScript podporuje

## 📊 Database Performance

### **Optimalizované indexy**:
```sql
-- Chaty
CREATE INDEX chats_user_id_ulid_idx ON chats(user_id, id);

-- Zprávy  
CREATE INDEX messages_chat_id_ulid_idx ON messages(chat_id, id);
```

### **Query performance**:
- **Chaty**: O(log n) díky composite index
- **Zprávy**: O(log n) díky composite index
- **Cursor queries**: Konstantní čas bez ohledu na pozici

## 🔄 Frontend Integration

### **React Example - Chaty**
```typescript
const [chats, setChats] = useState([]);
const [cursor, setCursor] = useState(null);
const [hasMore, setHasMore] = useState(true);

// Load More funkce
const loadMoreChats = async () => {
  const params = new URLSearchParams({
    fingerprint: 'xxx',
    limit: '10',
    ...(cursor && { cursor })
  });
  
  const response = await fetch(`/api/chats?${params}`);
  const data = await response.json();
  
  setChats(prev => [...prev, ...data.data.chats]);
  setCursor(data.data.nextCursor);
  setHasMore(data.data.hasMore);
};
```

### **React Example - Zprávy**
```typescript
const [messages, setMessages] = useState([]);
const [cursor, setCursor] = useState(null);
const [hasMore, setHasMore] = useState(true);

// První načtení (nejnovější zprávy)
const loadLatestMessages = async (chatId) => {
  const params = new URLSearchParams({
    fingerprint: 'xxx',
    chatId,
    limit: '10'
  });
  
  const response = await fetch(`/api/messages?${params}`);
  const data = await response.json();
  
  setMessages(data.data.messages);
  setCursor(data.data.nextCursor);
  setHasMore(data.data.hasMore);
};

// Scroll Up (starší zprávy)
const loadOlderMessages = async () => {
  const params = new URLSearchParams({
    fingerprint: 'xxx',
    chatId: 'xxx',
    cursor,
    limit: '10'
  });
  
  const response = await fetch(`/api/messages?${params}`);
  const data = await response.json();
  
  setMessages(prev => [...data.data.messages, ...prev]);
  setCursor(data.data.nextCursor);
  setHasMore(data.data.hasMore);
};
```

## 🧪 Testing

```bash
# Test chaty
curl "http://localhost:3000/api/chats?fingerprint=xxx&limit=10"

# Test zprávy - nejnovější
curl "http://localhost:3000/api/messages?fingerprint=xxx&chatId=xxx&limit=10"

# Test zprávy - starší
curl "http://localhost:3000/api/messages?fingerprint=xxx&chatId=xxx&cursor=CURSOR&limit=10"
```

---

**Implementace je připravena! Po instalaci `ulid` knihovny bude vše funkční.** 🎉 