Architecture, Database Schema & API Design for the LLM-Powered Documentation App
Architectural Overview

Multi-Tenancy Model: We will use a single shared database for all clients, with tenant identifiers (customer/org IDs) tagging every relevant record. This “tenant discriminator” approach allows efficient multi-tenant design without separate databases per client
crunchydata.com
. In practice, it means each table (e.g. Documents, Users, etc.) will include a column like org_id to isolate data. This is a common, scalable pattern – while it intermingles data, it drastically reduces maintenance overhead compared to managing separate schemas or databases for each tenant
crunchydata.com
. All queries will filter by the org_id to ensure a client only accesses their own data. Proper indexes on org_id (and composite indexes when combined with other fields frequently queried) will keep these lookups fast. We’ll also enforce tenant scoping at the application layer (e.g. via query filters in the ORM or middleware) to prevent any cross-tenant data leakage.

Asynchronous Processing for LLM Tasks: Invocations of the LLM (for document summarization or other AI operations) will be treated as long-running background tasks, so the user interface remains responsive. Instead of blocking an HTTP request waiting for the model, the API will offload these jobs to a task queue (using Celery with a Redis broker, for example)
testdriven.io
. This follows best practices: “if a long-running process is part of your workflow, rather than blocking the response, handle it in the background”
testdriven.io
. The typical workflow will be: the client calls a POST endpoint to initiate a task (e.g. “summarize this document”), the server enqueues a new task with Celery, and immediately returns a task ID (or some acknowledgment) to the client
testdriven.io
. The Celery worker processes then pick up the job, call external LLM APIs or perform heavy computation, and eventually store the result in the database (or cache) once done. The client can then poll a status endpoint or receive a push notification (see real-time updates below) to know when the task is complete
testdriven.io
. This pattern allows the web server (FastAPI) to quickly respond to other requests, improving throughput and user experience. We will maintain a Job/Task status table so that the frontend can query the state of any submitted operation (pending, in-progress, completed, or failed, with error info).

Figure: Asynchronous task workflow – the client initiates a background task via an API call, the FastAPI app enqueues it to Celery (with Redis as a broker/back-end), and returns a task ID. The client can later check the task status (via polling or push), while a Celery worker completes the job and stores results.
testdriven.io

Real-Time Updates & Notifications: To provide a smooth user experience, the system will leverage real-time updates for certain events, such as completion of a document summary or new content availability. Relying purely on polling can introduce unnecessary latency and load (the client repeatedly asking for updates)
hammadulhaq.medium.com
. Instead, we will implement a WebSocket channel (or Server-Sent Events) so the server can push notifications to the frontend instantly when key events occur
hammadulhaq.medium.com
. For example, when a background LLM task finishes generating a summary, the server will send a message over WebSocket to the user’s browser with the result data (or an indication that it’s ready to fetch). This bidirectional, persistent connection avoids the overhead of repeated HTTP requests and gives users near-instant feedback
hammadulhaq.medium.com
. Under the hood, FastAPI (with Starlette) supports WebSockets; we can authenticate the connection (e.g., via a token) and subscribe the socket to the user/org’s events. Whenever Celery finishes a job, our app can emit a WebSocket event to the appropriate user. Real-time updates will also be valuable for collaboration or multi-user scenarios – e.g., if one team member adds a new document, others in the same org could receive an update to refresh their view. (For initial simplicity, the MVP might implement just the task-completion notifications; other real-time features can be added as needed.) The real-time channel will be designed in a scalable way (using a publish-subscribe mechanism, like Redis pub/sub or a message broker, to broadcast events to WebSocket server instances) to handle growth in user count without degrading performance.

Integration Connectors & Extensibility: A core value of our app is integrating with external knowledge sources and destinations. We anticipate users will want to ingest documents from external platforms (like Notion pages, Guru cards, Confluence articles, etc.) as well as publish the AI-generated summaries or Q&A back into those platforms for wider access. Rather than writing and maintaining a bespoke connector for each third-party system in-house, we should leverage existing solutions or modular services for integrations. One approach is to use a unified API service (such as Merge.dev or Unified.to, or an open-source alternative like Nango) that provides a single normalized interface to many knowledge management systems
docs.unified.to
nango.dev
. These services handle the OAuth flows, data fetching, webhooks, and data normalization across multiple platforms, so our team isn’t solely responsible for every API quirk. For example, by integrating with a unified knowledge base API, we could support Notion, Confluence, Guru, etc., via one consistent data schema
docs.unified.to
. If we self-host an open-source solution like Nango, we get 500+ pre-built integrations with handling for auth, rate limits, pagination, and webhooks
nango.dev
nango.dev
 – significantly reducing custom connector development.

Whether using a unified API or our own integration microservice, we will design a Connectors module in our architecture. Each connector (e.g., “NotionConnector”, “GuruConnector”, etc.) knows how to authenticate (likely via OAuth2) and how to fetch or push data for that platform. Connectors might run in a separate service or process, especially if using webhooks or continuous syncing. For instance, if Notion provides content update webhooks, our connector service can listen for those and update the corresponding records in our database asynchronously. This decoupling ensures that if an external API is slow or fails, it doesn’t crash our main app – the connector can retry or queue the event for later processing (using an event consumer model).

It’s important that our integration layer supports both reading and writing to external systems. Some unified APIs only allow read (pulling data), but our use case needs CRUD capabilities – e.g., creating new pages in Notion or Guru to publish the summary
docs.unified.to
. We’ll ensure our chosen integration method (or custom implementation) supports creating and updating knowledge base entries, not just retrieving them. Initially, we will focus on a couple of key integrations (perhaps Notion and Guru, since many users store docs there). For authentication, we’ll stick to standard OAuth2 flows for third-party APIs. In MVP, a user can connect their account by clicking “Connect Notion” (for example), which redirects to Notion’s OAuth consent screen; after authorization, our system stores the OAuth tokens (possibly via the unified integration service) and establishes a link.

Extensibility for Custom Sources: We also want users to integrate their own custom data sources or tools if not already supported. In the short term, this can be achieved by providing a flexible data import API – e.g., an endpoint where they can programmatically push documents (with whatever content) into our system. That way, if a user has an internal system, they could write a small script to call our API and import data. In the future, we can allow more sophisticated custom connectors (perhaps a plugin architecture or a low-code “connector builder”). For instance, an admin could supply credentials and endpoint info for a custom system and our app could use a generic connector template to start pulling data. This is an advanced feature – for MVP, we note that our API-first design already enables custom integration: since everything (documents, etc.) is accessible via REST APIs, a technically inclined user can integrate any system by simply using our API as a bridge (or by forking an open-source connector service like Nango to add a new API). We will document these APIs clearly for external use.

System Performance & Scaling Considerations: The design emphasizes keeping the app snappy for end-users. By using background jobs for heavy lifting and WebSockets for instant notifications, we avoid blocking UI or making users wait on refresh. Data model choices (like indexing by org and using simple relational links) ensure queries are efficient. For example, listing documents for a user’s org will be a straightforward indexed lookup by org_id plus pagination. We will also cache rarely-changing data when possible (for instance, if there are any expensive computations or if we fetch external data that doesn’t change often). However, given the dynamic nature of docs and summaries, caching will likely be applied mainly to static reference data or templates. As the user base grows, the architecture can scale horizontally: multiple FastAPI app instances behind a load balancer (stateless except for the DB), multiple Celery workers to handle increased job volume, and the database can be scaled up (or even into a cluster) as needed. PostgreSQL is quite capable of handling our expected load on a single instance for the medium term, but we design the schema such that moving to partitioning or read replicas in the future would be straightforward. Real-time communication can scale via a message broker or a service like Redis-backed websockets (ensuring that even if users are connected to different app servers, they all get the messages).

Data Freshness and Sync: Especially for integration content, we need to keep data up-to-date so that summaries and answers are accurate. Ideally, we will opt for real-time sync where available – e.g. using webhooks from Notion/Guru so that whenever a source document changes, our system knows immediately
docs.unified.to
. Real-time updates ensure our embeddings or summaries don’t become stale and lead to wrong answers from the AI
docs.unified.to
. If a real-time mechanism isn’t initially available, we might schedule periodic sync (e.g. check every X hours for changes), but this is a compromise we’ll improve later. For MVP, we might implement a manual “Refresh” button for a document that re-fetches the latest content and re-generates the summary, to give users control. In any case, the architecture supports having a background sync task per integration (possibly running via Celery beat or a persistent integration service) that keeps content fresh.

LLM Usage Patterns: We will follow industry best practices for LLM integration to optimize user experience. Many companies use Retrieval-Augmented Generation (RAG) to ground LLM responses in factual data
medium.com
. In our context, that means if we implement a Q&A feature (users asking questions against their documents), we will likely maintain a vector index of document embeddings and retrieve relevant content to feed into the prompt. For summarization tasks, if documents are very large (longer than the LLM context window), we can employ a Map-Reduce summarization strategy
ibm.com
: break the document into chunks, summarize each chunk (Map phase) and then summarize the summaries into one (Reduce phase). This can be done in the background tasks as well. (For example, the Celery task for summarization could detect if a document’s length exceeds a threshold and then spawn sub-tasks or sequentially process chunks). This ensures we can handle large inputs gracefully. We’ll store and reuse embeddings rather than recompute every time, to keep latency and costs down
wednesday.is
. The database (or a specialized vector store) might keep an Embedding table linking document sections to embedding vectors for fast semantic search. These details will be abstracted from the user, but they influence our data schema (e.g. having a table for “DocumentChunks” or “Embeddings” with references to documents).

Security & Privacy: Each user’s data (documents and summaries) is kept separate via the multi-tenant scheme. We will enforce access control at the API level (users can only access resources of their org, and possibly roles within org for further restrictions). Data at rest in Postgres will be encrypted (standard for managed Postgres, or we can enable encryption). Communication with third-party APIs will use secure OAuth2 tokens stored safely (encrypted in DB). If using a unified integration service, we’ll ensure it adheres to zero-data retention or secure storage – for example, some providers operate in a passthrough mode with no persistent copy of data
docs.unified.to
, which could help with compliance. For now, we assume using trusted external services or our own infrastructure with standard security practices (SOC2 compliance ready). Any PII (like user emails) will be stored hashed or encrypted as appropriate. We will also keep audit logs for important operations (especially for enterprise users) – e.g. logging who created or accessed a doc or triggered an external push, to assist with debugging and compliance in the future.

With the high-level architecture in mind, below we detail the database schema and the API endpoints. These are designed to cover all the app’s scenarios in a data-driven way, enabling the frontend to retrieve and manipulate everything it needs via clear APIs. The focus is on a PostgreSQL schema using SQLAlchemy models, and a FastAPI REST API structure that a junior developer could implement given these specs.

Database Schema Design

Our schema includes tables for Organizations, Users, Documents, Summaries, Templates, Integrations, and Jobs/Tasks, among others. All tables will have a primary key id (usually an auto-increment integer or UUID) and timestamp fields (created_at, updated_at) for audit purposes. Every table that is tenant-specific will include an org_id foreign key referencing the Organizations table. The schema is normalized to avoid data duplication, but we also incorporate some denormalization for efficiency (for instance, storing org_id on all tables even if it could be indirectly obtained through joins)
crunchydata.com
 to simplify queries and indexing. Below is a breakdown of each major table and its columns:

Organizations (clients)

org_id (PK): Unique identifier for the client organization (e.g., UUID or serial).

name: Organization name.

plan_type: e.g., "free", "enterprise" (could determine feature access, not crucial for MVP).

created_at, updated_at: Timestamps.

(This table allows a single database to serve multiple client companies. For a single-tenant deployment, it could be simplified, but we’ll keep it to support multi-tenant SaaS usage.)

Users

user_id (PK): Unique user ID.

org_id (FK -> Organizations.org_id): The organization this user belongs to. All their actions scope to this org’s data.

email: User’s email address (unique per org or possibly globally unique).

password_hash: Hashed password (if using local auth). If we rely solely on third-party OAuth (Google, etc.) for login, we might not store a password, but having this allows flexibility.

auth_provider: Enum or text (e.g., "local", "google", "okta") – indicates how the user authenticates. For MVP likely "local" or "google".

name: Full name of the user.

role: User role in the org (e.g., "admin", "member") to manage permissions (optional for MVP, but could restrict who can manage org settings).

created_at, updated_at.

Users will log in to our app (for MVP, via standard username/password or a simple OAuth2 login for Google). We defer complex SSO like SAML/OIDC for enterprise (Okta, etc.) until future iterations as noted. The presence of auth_provider allows adding those later without changing the schema.

Documents

doc_id (PK): Document identifier.

org_id (FK -> Organizations): The org that owns this document.

user_id (FK -> Users): The user who uploaded or created the document (for attribution).

title: Title or name of the document.

content: The raw content of the document (could be TEXT type, supporting large and unicode text). We ensure the DB encoding is UTF-8 so it can store any language or symbol
tigerdata.com
 – this covers “custom symbols” or special characters that might appear in docs. (PostgreSQL’s default UTF-8 encoding can handle nearly all characters and emoji
tigerdata.com
.) For very large documents or binary files, this might instead contain extracted text or a reference (see below).

source_type: Enum or text describing where this document came from. For example: "upload" (user uploaded directly), "notion", "guru", "google_drive", etc.

source_url or external_id: If the doc is from an integration, we store an identifier to link back to the original (e.g., the Notion page ID or URL, Guru card ID, etc.). This helps with updates: if the source content changes, we know which doc to update.

external_last_updated: Timestamp of the last update in the source system (if applicable), so we know if our copy is stale.

status: Status of the document in our system – e.g., "active", "updating", "error". If, say, an import from an external system is in progress or failed. Typically "active" for usable docs.

created_at, updated_at.

For document content storage, we’ll use TEXT for now (Postgres can handle even MB of text in a TEXT field via TOAST storage). In case of binary files (PDFs, Word docs), we will parse them upon upload (extract text to this field for LLM processing) and might also store the original file in cloud storage (and keep a file URL in a separate field like file_url). The Documents table essentially forms the knowledge base of content that can be summarized or queried.

Edge case considerations: The schema allows storing documents in any language or containing any characters (thanks to UTF-8), so even if a user’s doc has, say, mathematical symbols or Unicode icons, it will be preserved. If documents are extremely large (beyond LLM context limits), our processing will chunk them, but we still store them as a single logical doc (with possible segmentation handled at processing time or via a related table if needed). We’ll also consider versioning: MVP doesn’t do version control, but one might extend the schema with a DocumentVersion table if users needed to see history. For now, updated_at on Documents suffices to know when content was last changed (either by a user editing it or by an automated sync).

Summaries

summary_id (PK): Summary record ID.

doc_id (FK -> Documents): The document this summary is for.

org_id (FK -> Organizations): Redundant but convenient to have (so we can easily query all summaries by org, and double-protect multi-tenancy).

created_by (FK -> Users): Which user (or system) initiated or created this summary.

template_id (FK -> Templates, nullable): If a custom template was used to generate this summary, reference it. Null or a default value if the standard summarization was used.

summary_text: The actual text of the summary. This will typically be a few paragraphs or bullet points, far shorter than the source content. (Also stored in UTF-8 text format.)

format: Optional field indicating the format or style (e.g., "bullet_points", "executive_summary", or if in Markdown, etc.). This might be inferred from the template or user selection.

tokens_used: (Optional) integer count of tokens the LLM used, for cost/logging.

model_used: (Optional) which LLM model generated it (e.g., "GPT-4", "Anthropic Claude v1") – useful if we let users choose models or for debugging quality.

status: If we create the Summary record before the generation is complete, we might have statuses like "pending", "complete", "failed". Alternatively, we only insert once complete (so status would always be complete for persisted ones, and failures might not have a record here but rather in the Jobs table). Depending on implementation, we could go either way. Storing a status here can help if we want to show “summary is updating…” in the UI by looking at the doc’s summary status.

created_at, updated_at.

We separate Summaries from Documents because a single document might have multiple summaries. For example, a user could generate a short summary and a detailed summary, or use different templates (one focusing on risks, another on opportunities, etc.). Rather than overwriting, we keep each result. We can designate one as the “active” or “default” summary if needed (perhaps add a boolean flag or store the latest summary_id on the Document table). But having all summaries allows auditing and comparing outputs. It also enables showing improvements over time or allowing the user to regenerate if the content updates.

Edge cases: If a document is updated significantly, old summaries may become outdated. We might mark them as stale or automatically generate a new one. For MVP, we might leave that to user action (they can hit “regenerate summary” after content change, which creates a new Summary entry). Storage of summary_text is straightforward as it’s much shorter than source content. We will allow summaries to be edited by users in the frontend in future (e.g., user corrects or tweaks the AI summary). In that case, we might add a column like edited_text or a flag is_edited to indicate divergence from the AI output. That is not strictly needed for initial functionality, but we note it for completeness.

Templates

template_id (PK): Template identifier.

org_id (FK -> Organizations, nullable): The org that owns this template. Null or a special org_id could indicate a global template available to all (if we provide some defaults).

name: Template name (e.g., "Pros/Cons Summary", "Detailed Technical Summary", "Custom Compliance Summary").

prompt_template: The text of the template/instructions for the LLM. This might include placeholders for the content insertion. For example, a template might be: "Summarize the following document focusing on key risks and outcomes: <<DOCUMENT_CONTENT>>". We’ll decide on a placeholder convention (<<DOCUMENT_CONTENT>> or similar) and at runtime replace it with the actual doc content (or truncated content if needed). The template could also contain formatting directives (“respond in JSON” etc. if we ever needed).

description: A short description of what this template does (for UI hover or selection).

created_by (FK -> Users): who created it (if user-defined).

is_default: Boolean – whether this is a default system template (for our internal listing). For user’s custom templates, false. (Or we can differentiate by org_id null as mentioned.)

created_at, updated_at.

Custom templates allow users to tailor the AI output. The frontend will likely offer a dropdown of templates when asking for a summary. The user’s selection will be sent (template_id), and the backend will fetch the prompt template text, insert the document content, and send that to the LLM API. By storing templates, we ensure the app is data-driven (new templates can be added without code changes). We should also store templates for any other LLM operation that might be templated (for instance, if in the future we have a Q&A prompt template or a glossary-generation template, etc., they could reside here too, distinguished perhaps by a type field). For now, type is implicitly “summary” templates. If needed, we could add a column template_type (e.g., "summary", "qa", "formatting", etc.) to categorize templates for different uses.

Edge cases: Templates might include special symbols or multi-line text – our use of a text column with UTF-8 covers that. We must be careful to validate user-provided templates (so they don't break prompt injection safety or include something malicious). Templates might also possibly reference other variables (like if a template expects a title, etc.), but MVP we assume it just wraps around document content. We also might limit how many custom templates a user can create (to avoid clutter or abuse), possibly enforced at the application level.

Integrations

integration_id (PK): Integration connection identifier.

org_id (FK -> Organizations): The org that this integration belongs to.

integration_type: The service name or code, e.g., "notion", "guru", "slack", "confluence", "google_drive", etc. This can be an enum or a string from a defined set.

auth_type: Type of auth used (likely "oauth2" for most, but could be "api_token" or others). This is more for reference.

access_token: Encrypted storage of the OAuth2 access token (if applicable).

refresh_token: Encrypted refresh token (if applicable).

token_expires_at: Timestamp when the current access token expires (so we know when to refresh).

config: A JSON or text field for any additional config or credentials. For example, Notion integration might need a “Notion database ID” if we are syncing a specific database, or a Slack integration might store default channel ID to post to. This field provides flexibility to store extra info per integration without adding many columns.

status: Status of the integration – e.g., "connected", "error", "revoked". If an API call fails due to auth, we might mark it "error" until re-authenticated.

last_sync: Timestamp of the last successful sync (if we do periodic syncing).

created_at, updated_at.

Each row here represents a connection to an external system. If a user connects both Notion and Slack, there would be two entries. For OAuth2 flows, upon successful authorization, we’d create an entry. Note: We might not store the raw tokens in our DB if using a service like Nango – Nango might handle tokens internally and just give us an ID or we store minimal info. In such case, access_token might be replaced by an external reference (like a Nango connection ID) and Nango’s service holds the secret. But from a schema perspective, we show it as if we store them (because in a simple implementation, we might store tokens directly for use by our code). Security best practice would be to encrypt these at rest (Postgres can use extension like pgcrypto, or just let our app encrypt before saving).

Edge cases: If an org wants multiple of the same type (e.g. two different Notion workspaces) – our schema allows multiple rows with integration_type = 'notion' as long as they have different tokens (effectively different accounts). We might use the config field to label them or store the workspace name for the UI. We’ll also include basic error handling: e.g., if tokens expire or are revoked, our integration logic will catch an unauthorized response and update status to "error" and possibly wipe tokens, prompting the user to re-connect. For MVP, we’ll assume one account per integration type is enough (one Notion workspace connected, etc.), but nothing prevents more.

IntegrationTargets (optional enhancement)

(This is not mandatory for MVP, but worth considering if we want to store where to publish summaries.)

If we decide to allow pushing summaries to external platforms, we might have a table to track what content has been pushed where. We could call it PublishedDocuments or ExternalPosts:

publish_id (PK)

summary_id (FK -> Summaries) or doc_id (if we push the raw doc) – referencing what we published.

integration_id (FK -> Integrations): which integration we pushed to.

external_resource_id: ID of the created resource on the external platform (e.g., the new Notion page ID, or Guru card ID, or Slack message ID if posting summary as a message).

external_url: URL to that resource (for convenience if we want to allow user to click it).

status: "success", "failed", etc., if the publish action is asynchronous.

created_at, updated_at.

In MVP, we may not need a whole table if publishing is done immediately and we don’t need to track it beyond maybe showing a link. But if the app allows publishing multiple times or to multiple places, tracking is useful. For example, a user could push the same summary to Slack and to Notion – we’d have two records. This also helps avoid duplicate publishing (we can check if already published to a target). For now, consider this table as a placeholder for that capability. Alternatively, we could incorporate a published_to JSON within Summaries, but a separate table is cleaner if it gets complex.

Jobs / Tasks

job_id (PK): Task identifier (could use Celery’s task UUID or our own).

org_id: The org (redundant but useful for multi-tenant filtering of jobs).

user_id: The user who initiated the task (if applicable; system/auto tasks might be null or a system user).

job_type: Type of task, e.g., "summarize_document", "regenerate_summary", "publish_summary", "sync_notion", "embed_document", etc. This helps identify what action is being performed.

related_id: Reference ID related to the task, semantics depend on type. For example, if job_type = "summarize_document", related_id might be the doc_id (or summary_id if we pre-created one). If job_type = "publish_summary", related_id could be the summary_id. If job_type = "sync_notion", maybe integration_id or null if syncing all. We can also use a separate field for each if needed, but a generic field plus type covers it.

status: "pending", "in_progress", "completed", "failed".

result: Could be a JSON or text field with result info. For a summarize task, once complete, this might hold the summary_id that was generated (or the summary text if we didn’t store it elsewhere). For a publish task, it could hold "success" or link. For sync, maybe stats about new docs imported. We keep it generic.

error_message: If status = failed, optional error log or message.

queued_at, started_at, finished_at: Timestamps to track task timing. (At least queued_at and finished_at to compute duration, and maybe started_at if we want to separate queue wait vs run time.)

created_at, updated_at: (created_at might equal queued_at, updated_at could update as status changes).

This table is useful for the frontend to retrieve ongoing or past tasks. For example, the frontend could call GET /jobs?status=pending to show if something is still processing, or show a history of completed tasks if needed. For MVP, we may primarily use it to check a specific task status. We can store Celery’s task ID here to correlate, or even use Celery’s ID as our primary key if we want. But it’s often helpful to have our own tracking so we can attach user and org easily (Celery’s built-in result backend could be used too, but direct DB gives more flexibility in queries and joins).

Edge cases: Many tasks might be created over time, so this table could grow large. We can periodically prune old completed tasks (or archive them) to keep it slim. Or only keep last X days of tasks if needed. Also, if a task fails, the error_message helps surface issues to the user (we should sanitize any raw errors). We will also have to consider idempotency – if a user triggers the same action twice accidentally, we might either de-dupe or allow it; the task table can help detect “already running” tasks (e.g., if a doc is currently summarizing, we might prevent a second request on the same doc concurrently). We can implement such logic by checking for an existing pending task of type summarize for that doc.

Embeddings (optional)

(If implementing semantic search or Q&A, a table to store document sections and their embeddings)

emb_id (PK)

doc_id (FK -> Documents)

org_id (FK -> Organizations)

chunk_index: If a document is chunked into pieces for embedding (e.g., chunk 0, 1, 2 of the doc).

text_chunk: The text content of this chunk (or a reference to location in the doc content).

embedding_vector: The vector representation (if using Postgres with pgvector, this column type is VECTOR; or we could store as array of floats).

embedding_model: which model was used to embed (e.g., "text-embedding-ada-002").

created_at.

This table would be populated when a new doc is added or updated: we generate embeddings for each chunk of the document and store them. It allows efficient similarity searches via pgvector or we could use an external vector DB instead. If using an external vector store (like Pinecone or Weaviate), we might not need this table. But having it in Postgres (with the pgvector extension) keeps everything in one place for simplicity, at least initially. Given the user’s focus on summarization, we may not implement full Q&A search in MVP, but the design leaves room for it.

Other Tables / Considerations:

Feedback: If we want to capture user feedback on summaries (e.g., user thumbs-up or thumbs-down an AI result), we could have a Feedback table linking user -> summary -> rating/comment. Not required in spec, but a nice-to-have for continuous improvement.

Notifications: If we want to store events to notify users (instead of just ephemeral WebSocket messages), a Notifications table could log events (like “Doc X summary completed at time Y”). This could back a notification center in the UI. For now, we might skip persisting those and just use WebSocket pushes, but it’s something to keep in mind for auditing.

API Keys / Tokens: If we later expose an API for users (so they can programmatically do what the UI does, e.g., send documents via API), we might have an API_Tokens table to manage personal access tokens. Not needed at MVP unless we explicitly want to offer that to power users for integration (which might actually satisfy some “custom integration” needs!). We’ll omit for now but remember it as an extension.

All tables use UTF-8 encoding by default (PostgreSQL default), meaning we support the full range of Unicode characters in text fields – letters, symbols, emoji, etc., ensuring no data loss for “custom symbols” or non-English content
tigerdata.com
. We will use transactions for multi-step operations to keep data consistent (e.g., inserting a doc and related summary together if needed). Each table will have appropriate foreign key constraints to maintain referential integrity (with ON DELETE CASCADE or SET NULL as appropriate – for instance, if a user is deleted, perhaps we set their entries’ created_by to null or keep them for history; if an org is deleted (rare in SaaS, usually we’d just disable), we’d likely cascade to all their data).

Indexes: By default, the PKs are indexed. We will add indexes on foreign keys (org_id, doc_id in summaries, etc.) to speed up joins and lookups. Composite indexes might be added for frequent query patterns – e.g., on Documents(org_id, title) if we often search titles per org, or on Summaries(doc_id, template_id) if we frequently fetch a doc’s summary by template. We should also consider indexing fields like integration_type in Integrations if we query by type, but likely we query by org mostly. If using pgvector for embeddings, we’d create an index for vector similarity search on embedding_vector (with something like USING ivfflat index type).

Data Access Patterns and Efficiency: The way the data is organized supports the frontend’s needs with minimal queries. For example:

To display a list of documents, we can query Documents for that org (filter org_id) and select basic fields (id, title, perhaps status or summary snippet). This is a single query. If we want to show a summary preview in the list, we might join to Summaries (either selecting the latest summary_text or having a denormalized latest_summary field in Documents for quick access). We may choose to update a latest_summary field on Document whenever a new summary is created, to avoid a join for the common case of showing the most recent summary. This is a trade-off (denormalization for read performance vs maintaining consistency). Given user experience priority, that denormalization could be worth it: e.g., add last_summary_id on Documents and maybe last_summary_text materialized for quick display. For MVP, a simple join is fine, but we note the option.

To get full document details, the frontend calls GET /documents/{id} – we fetch the Document by id (ensuring org match for security) and include related Summaries (maybe the latest or all). We can either embed the summaries in the response or have a separate endpoint for summaries. Likely, we’ll have an endpoint for all summaries of a doc if needed, but we might also just include the current summary in the document detail for convenience.

When a user triggers a summary generation, we insert a Job and possibly a pending Summary (or we wait to insert summary when done). The task runs and updates DB. The frontend either polls GET /jobs/{job_id} for status or waits on WebSocket. The summary appears when ready by either the push or by client fetching it via the document detail again. Because all state is in the DB, any frontend (or even multiple sessions) can query and get updated info.

Integration data flow: say a user connects Notion. We store integration and then perhaps immediately trigger an import job to fetch some initial docs (the connector might either fetch all pages or we might ask user which pages to import). If automatic, our integration code (maybe via unified API) pulls a set of pages and creates Document entries for each, linking back with external IDs. Those documents now appear in the UI. If using real-time sync, further updates in Notion will trigger webhooks that result in our integration module updating the Document’s content and bumping its updated_at. We might also automatically enqueue a summary regeneration if content changed significantly. This way, the user will always see up-to-date summaries in our app with minimal manual effort.

Publishing flow: when user clicks “Publish to Notion”, we create a Job of type publish. The worker handles it, calling the Notion API to create/update a page with the summary. On success, it stores the external ID and marks job complete. The UI gets a notification, and could then show e.g. “Published ✓” and possibly the link. If we implement the PublishedDocuments table, we also insert there. That allows the user to later see where summaries have been sent.

Overall, the schema is designed to be comprehensive yet flexible, covering custom templates, multiple integrations, and various LLM operations. Next, we outline the API endpoints that the frontend will use to drive the app. Each endpoint is described with its purpose and expected input/output. The API is organized in a RESTful manner with clear resource paths and uses standard HTTP verbs.

API Endpoints Specification

Below is a list of all necessary API endpoints for the application, grouped by feature area. All endpoints will be under a base URL (e.g., /api/v1/ if we version our API). We assume authentication is handled via a token (e.g., JWT or session token) passed with each request (except the auth endpoints). The FastAPI backend will use dependency injection or middleware to verify the token and identify the user_id and org_id for each request, applying authorization checks. Responses will typically be JSON with appropriate status codes (2xx for success, 4xx for client errors, etc.). We will preserve the citations and references for design justifications but focus here on functionality.

Auth & User Management

POST /auth/register – Register a new user account.
Request: JSON body with name, email, password.
Response: JSON with newly created user info and a token (e.g., JWT) for immediate login, or just a success message (if email verification step is required, but for MVP probably not).
(If our product is B2B, user creation might be invite-only via an admin, in which case this endpoint might not be open to the public. But for completeness, included if self-service signup is allowed.)

POST /auth/login – Authenticate and retrieve token.
Request: JSON with email and password (or an OAuth authorization code if using third-party login – in that case, this endpoint might vary, see below).
Response: JSON containing an access_token (JWT or session cookie) and perhaps the user profile. The token is used in headers for subsequent calls (e.g., Authorization: Bearer <token>).
(If using OAuth with Google, we might not need this for Google – instead, front-end could use an OAuth library. Alternatively, we provide a variant like GET /auth/oauth2/google/login-url to get a Google OAuth URL, and GET /auth/oauth2/google/callback to receive the code and then create/join user – but to keep things simple, assume at least local login is supported).

POST /auth/logout – Logout the current user.
Request: (No body, just needs auth token to invalidate).
Response: 200 OK on success.
(If using JWT stateless, this might be handled client-side by discarding token; or we maintain a token blacklist server-side. In any case, it’s good to have an endpoint to hit for logout for completeness, even if it just removes a session cookie.)

GET /auth/me – Get current logged-in user profile.
Request: None (just send token).
Response: JSON with user details (id, name, email, org info, role, etc.).
This helps the frontend confirm who is logged in and display user info or org name, etc.

(Note: SSO providers like Okta, Azure AD, etc., would involve setting up SAML/OIDC which is complex – we defer that. For MVP, supporting Google OAuth might be a nice-to-have, but not required. The system can work with just our own username/password. If Google login is desired, we would add an endpoint to handle the OAuth callback where we create or find a user with the Google email and mark auth_provider = 'google'.)

Organization & Team Management

GET /org – Get organization details.
Response: JSON with org name, plan, created date, maybe statistics (# of users, # of documents).
(This could also be part of /auth/me if we include org info there.)

PUT /org – Update organization info.
Request: JSON with fields to update (e.g., name). Admins only.
Response: Updated org info.
(Not crucial for MVP unless allowing org name change or such. Could be omitted initially.)

GET /org/users – List users in my organization.
Response: JSON list of users (id, name, email, role).
(For single-user scenarios this is trivial, but for multi-user orgs it’s useful for an admin view or future features like sharing. MVP can have at least the backend ready for it.)

POST /org/users/invite – Invite a new user to the org.
Request: JSON with email (and possibly role).
Response: 200 with result (e.g., an email invite is sent or a link generated).
(We might not implement full invite flow in MVP, but this is how it would work: generate a signup link tied to org.)

DELETE /org/users/{user_id} – Remove a user from the org.
Only allowed for admin and if not removing themselves unless deleting org.
(Again, more of an admin feature; not required if we are focusing on single-user in early stage.)

(Organization management might be minimal early on, but I included for completeness. The app is single-tenant in DB design but multi-org logically, so some admin endpoints make sense.)

Document Operations

GET /documents – List documents accessible to the user’s org.
Query Params: optional filters like source=notion (to filter by integration), or q=searchterm (for a simple search by title or content), and pagination params (page, page_size).
Response: JSON array of documents. Each item could include basic fields: doc_id, title, source_type, maybe a short preview or summary snippet, and statuses. We avoid sending full content here for performance; content and full summary are retrieved from detail API. We might include has_summary=true/false or last summary date to show if summarized.
This endpoint allows the front-end to display a list or table of documents. We’ll sort by created or updated date by default, or allow sort param.

POST /documents – Create a new document (upload or import).
There are a few scenarios for creating a document:

Direct upload: The user uploads a file or pastes text. In REST, file upload could be handled via a multipart form if using an HTML form, or the front-end can first upload the file to cloud storage (if we do that) and then call this API with the text content or file link. For simplicity, assume the frontend will send either a text or a file in the request. We can support both:

If content (text) is provided in JSON, we use it.

If a file is provided (say via multipart), we extract text server-side (e.g., using PDF parser) then create the doc.

Import from integration: The user selects an integration source. Perhaps they provide an identifier (like a Notion page URL). The request might have source_type="notion" and external_id="<notion_page_id>". Our backend would then call the Notion API (or unified API) to fetch the page content and create the doc. This might be done synchronously if quick, or asynchronously if heavy. Possibly we treat it as a job (especially if user wants to import many docs at once).

Request: JSON (or multipart) with at least one of:

title (if not provided, we might derive from file name or content),

content (raw text content, if uploading text directly),

file (if multipart, the file itself; the backend will need to handle file saving and text extraction),

source_type (if creating via integration, e.g., "notion"),

external_id or external_url (identifier for external doc),

integration_id (to specify which account if multiple; or we can infer if only one per type).

Response: JSON with the created doc_id and maybe the document record. If the creation is done synchronously (we have content and saved it), we return 201 Created with doc info. If it’s an import that will happen asynchronously (like a large batch import), we might instead return 202 Accepted with a job_id. For MVP, we likely do it synchronously for single documents:

For a file upload, by the time we respond, the doc is stored (and perhaps we immediately trigger a summary job, see below).

For an integration import of one item, we can fetch it within the request (Notion’s API call for one page is fast) and then respond with the created doc.

For a bulk import (not in MVP), we’d spawn a job.

This endpoint is key as it allows adding new content. It will also handle ensuring the text is stored in Unicode-safe way, etc. After successful creation, the front-end could optionally call the summarize API next, or we might have a flag here like auto_summarize: true in the request to kick off summarization immediately. To keep separation, we do that in a separate call.

GET /documents/{doc_id} – Retrieve full details of a single document.
Response: JSON with all document fields (id, title, content, source info, etc.) and associated data such as:

A list of summaries (maybe just the latest one or all summaries for this doc – we can decide, possibly include all with their template info and created_at).

Perhaps any analysis or metadata (like word count, embedding status).

Possibly related info like if it was imported via integration, include integration_type and a link to original (so UI can show “from Notion, click to open original”).

The content text might be large, but since this is a detail endpoint, it’s expected. If the content is extremely large (MBs), we might consider not sending it unless specifically requested (maybe a flag include_content=true). But likely fine to send if user opened the document detail or editor.

The frontend will use this to display the document and its summary, etc. If the document is of a type that can be rendered (like PDF), maybe the raw text is not shown directly to the user, but we might still provide it for the AI context. The UI could use this for an editor or just to confirm content.

PUT /documents/{doc_id} – Update a document’s metadata or content.
Request: JSON with fields to update. We might allow updating the title or even the content (if a user wants to edit text in our app). If the content is edited, we should probably invalidate existing summaries or mark them stale. Possibly we set an updated_at which front-end sees and might prompt the user to regenerate summary. We could optionally automatically queue a new summary job on significant edits.

Response: JSON with updated document record.

(If we don’t allow content editing in MVP – maybe they only consume content from external or upload – this endpoint might mainly allow renaming a doc or toggling something. But it's good to have for future editing capabilities.)

DELETE /documents/{doc_id} – Delete a document.
This will remove the document and any summaries (cascade delete) for that org.
Response: 200 OK on success (or 204 No Content).
We must ensure only authorized users (the uploader or an admin) can delete. In integration scenarios, deleting in our app does not delete the original source; it just removes our copy. That’s fine – we might also consider a warning if the doc is from an integration, that it will be re-imported on next sync unless the user also disconnects or ignores that item. For MVP, deleting just our copy is acceptable.

POST /documents/{doc_id}/summarize – Initiate summarization of a document.
This endpoint triggers the LLM to generate a summary for the given doc.
Request: JSON with options such as:

template_id (which template to use; if omitted, use a default generic summary template),

model (if we allow choosing different LLMs, otherwise not needed and we use a default configured model),

Possibly length or style parameters (could be covered by template selection).

Response: We have two possible approaches:

Asynchronous (preferred): Return immediately with a job_id (and maybe status = "queued"). For instance: { "job_id": "12345", "status": "queued" }. The client can then listen on WebSocket or poll the Job endpoint.

Synchronous: The call waits until the LLM responds and returns the summary directly. This is not ideal if the doc is large or model is slow (GPT-4 can take many seconds). It also could cause request timeouts if it exceeds a limit. So we lean asynchronous.

We will implement it as asynchronous. The server will enqueue a Celery job to generate the summary. The job will:

Retrieve the document content from DB,

Retrieve the template text (if any) and fill in the content,

Call the LLM API (OpenAI or other) with the prompt,

Get the summary result, post-process if needed,

Store the new summary in the Summaries table (and perhaps update Document.last_summary_id),

Mark the job status as completed.

Meanwhile, the client either polls GET /jobs/{job_id} or receives a WebSocket event like {"event": "summary_completed", "doc_id": 42, "summary_id": 99}. We will support both methods for flexibility. Polling might look like the client calling GET /documents/{doc_id} periodically to see if a summary appears or using the job status API.

By making summarization explicit via this endpoint, we give users control (so they can choose when to summarize and with which template).

GET /documents/{doc_id}/summaries – List all summaries for a document.
Response: JSON array of summary entries (each with summary_id, template_id (with template name maybe expanded), created_at, and text – perhaps truncated if we only want to show the beginning for selection). If there are multiple summaries, the user might want to view historical ones or compare different template outputs. The frontend could call this to populate a dropdown of versions.

If we assume one active summary per doc for MVP, we can skip this and just include the latest in the document detail. But implementing it is trivial and aligns with our data model that supports many summaries.

DELETE /summaries/{summary_id} – Delete a specific summary.
This could be allowed if, say, a user wants to remove an outdated or incorrect summary (especially if multiple present). Not a common action, but we can provide it for completeness or simply let it be implicit (if a document is deleted, summaries go too). It’s low priority. Possibly only an admin or the user who made it can delete it.

POST /documents/search – Search documents (and possibly their content).
(This could also be a GET with query param, but if we allow complex filters or a large query, POST is fine.)
Request: JSON with search criteria: e.g., query string. Possibly a flag use_semantic: true to indicate using embeddings for semantic search, but that might be automatic if we have embeddings.
Response: JSON list of documents (or even specific snippet matches). For MVP, a simple full-text search on titles/content can be done with ILIKE or Full Text Search in Postgres. If we integrated a vector search, this would involve retrieving relevant chunks and possibly directly returning an answer via LLM (which becomes more of an ask-a-question endpoint). We might not implement semantic search in MVP, but I include this as a placeholder for finding documents by keyword. The user story might be: “I want to find if any document mentions X and then summarize or open it”.

If we do have Q&A feature:

POST /query – user asks a question; server finds relevant docs via embeddings and LLM formulates answer. That would be similar to summarization in that it’s an LLM task, so likely handled asynchronously as well if long. But since it’s not explicitly asked in this task, we won’t detail it fully.

Template Management

GET /templates – List available templates.
Response: JSON array of templates. This includes both global templates (provided by the app) and the user’s custom templates. We can filter by org or the backend can merge global ones (org_id = null) with org-specific. We should include at least: template_id, name, description. We likely do NOT send the full prompt text here for all, since it could be large or we might consider it somewhat sensitive. However, since templates are user-created or known, it’s probably fine to include prompt_template if needed (the frontend might not need to know the internal text, just the effect). Possibly we exclude it to avoid exposing how the prompt is structured (especially for system defaults). The user’s own templates we can show fully if we allow editing.

POST /templates – Create a new custom template.
Request: JSON with name and prompt_template (and maybe a description).
Response: JSON with the created template (id and info).
We’ll attach it to the user’s org and user (created_by). This allows the user to then use this template in /summarize calls.

PUT /templates/{template_id} – Update a template.
Only for templates belonging to the org (or global ones maybe via admin interface not for normal user).
Request: JSON with updated name or prompt_template or description.
Response: Updated template JSON.
(This allows editing a custom template if the prompt needs tweaking.)

DELETE /templates/{template_id} – Delete a template.
Only if it’s a custom template of the user’s org. We won’t allow deleting built-in templates.
Response: 200 on success. After deletion, we should ensure any summaries referencing this template still keep the text (they do, since summary_text is stored) but their template_id could be null or stale. That’s fine; or we could disallow deletion if it’s used. Probably allow deletion regardless, it doesn’t break anything except you can’t regenerate with it unless re-create it.

These template endpoints let users extend the app’s capabilities. A junior dev can implement these easily with FastAPI CRUD routes and SQLAlchemy models binding to the Templates table.

Integrations & Connectors

GET /integrations – List configured integrations for the org.
Response: JSON list of integrations. For each: integration_id, integration_type, status, maybe a user-friendly name (some APIs give an account name or we might store one), and relevant metadata (e.g., for Google Drive maybe which folder is linked, if we had such config; for Notion perhaps the workspace name). We might avoid sending actual tokens for security. The UI uses this to show “Connected Accounts” and their status.

POST /integrations – Connect a new integration.
Because OAuth flows are involved, this might actually be a two-step or multi-step process:

Option 1: OAuth redirect method – The frontend gets a URL from us and handles redirect:

Frontend calls GET /integrations/{type}/authorize – we respond with an auth_url to the provider’s consent page (this URL is generated using our OAuth client credentials for that provider).

User is redirected to that auth_url, logs in and approves.

The provider calls our redirect URI endpoint, which we handle in FastAPI (e.g., GET /integrations/{type}/callback).

In that callback, we receive a code, we exchange it for token by calling provider’s token endpoint, then create the Integration entry in DB with tokens.

Finally, we may redirect the user’s browser back to the front-end app (maybe a specific route, or instruct them to close a popup).

Frontend then calls GET /integrations to refresh the list and sees the new connection.

Option 2: Backend-driven (no UI redirect) – For some API tokens or simpler auth, user might input an API key into a form which posts directly. For example, some internal tool might just provide an API token string, which user can paste and we store. In that case, POST /integrations with a JSON containing integration_type and perhaps api_key in config. We then test the connection if needed and store it.

For MVP, implementing the full OAuth redirect flow is more involved, but definitely doable since FastAPI can have routes for callback. Using an open-source service like Nango can simplify this: Nango provides a pre-built widget for OAuth. We might just redirect to Nango’s hosted page or open a popup to it, and Nango will handle and eventually give us a stable connection ID via its API. In that scenario, POST /integrations might simply carry something like provider = notion and an authorization code or token from Nango, and we store that. However, to avoid confusion, let’s outline a straightforward approach:

GET /integrations/{type}/authorize – Get OAuth authorization URL for the given provider.
Response: JSON with url to redirect the user to. (If not using a separate UI, our frontend could just redirect the whole window to this, or open a new window.)

GET /integrations/{type}/callback – OAuth callback endpoint (server-side).
This isn’t called by frontend, but by the external provider. We will configure the provider to call this URL with a code. Our server will then perform token exchange.
Response: Could be an HTML or simple page saying “Success! You can close this window.” Then the frontend knows to refresh integration status. (The callback might also include a state query param so we know which user initiated it, ensuring security. We'll tie that to the user's session.)

Internally on callback, we do:

verify state token (to prevent CSRF),

call provider to exchange code for token,

store integration (with tokens) in DB,

possibly queue an initial sync job,

and then render a success message or redirect back to the app.

If an integration doesn’t require interactive auth (like if user just provides API key), we skip those endpoints and just use POST as mentioned:

POST /integrations (alt usage) – send integration_type and credentials. For example: { "integration_type": "confluence", "config": {"base_url": "...", "api_token": "..." } }. The backend validates (maybe tries a simple API call) and saves if okay. This is for future or less common cases.

DELETE /integrations/{integration_id} – Disconnect an integration.
Response: 200 on success. This will delete the stored tokens and config. We might also optionally delete all documents that came from this integration (or offer that as an option). For safety, MVP might just stop syncing but keep any data already imported (the user can manually remove if they want). Deleting integration likely means we stop updates and perhaps mark those docs as read-only or orphaned. But simplest: do nothing to docs on disconnect (they become static snapshots). The user can reconnect later and possibly get updates or duplicates. This is something to refine later (maybe identify docs by integration and allow removing them too if desired).

POST /integrations/{integration_id}/import – Import data from integration.
This could be used to trigger a one-time or manual sync.
Request: JSON with maybe specifics like resource_id or all=true.
Use cases:

Import a specific item: e.g., Notion page ID given, import just that.

Bulk import all: if all or no specific ID given, fetch all accessible docs (could be heavy, might spawn background job).

Maybe filter by a folder or space (some integrations allow scope, e.g., a specific Notion database or Confluence space – we might have stored that in integration.config if user selected during connect).

Response: Could be a job triggered. Likely, if many items, we return job_id for an async sync. If just one item and quick, we could do sync and return the new Document record. But it’s safer to queue if we don’t know the volume. Possibly we implement both: if a specific resource_id is provided, we do it synchronously (one API call to fetch doc, one insert, done). If no id (meaning import many), we async.

This endpoint allows the user to manually initiate syncing, aside from any automated background sync that might be running. For MVP, manual import might be what we do instead of a continuous sync service.

POST /integrations/{integration_id}/sync – Webhook receiver or manual sync trigger.
If using webhooks from external services, those webhooks would hit an endpoint on our server (which could be this). For example, Notion’s webhook calls a URL when a page in a connected workspace updates. We’d configure that URL to point to something like POST /integrations/notion/webhook (with some security verification). That endpoint isn’t directly called by our user, so it might not need to be documented as part of public API, but as developers we’d implement it. It would receive an event (page X updated), then create a job to update that document in our DB and possibly regenerate summary. This is more internal. We mention it to emphasize we plan for real-time updates from connectors where possible.

(Thus, our app will have some callback endpoints for integration events, separate from user-driven APIs. These will be secured via tokens or secret keys from the provider to ensure only genuine calls are accepted.)

Summaries & Publishing (some covered above)

GET /summaries/{summary_id} – Fetch a specific summary by ID.
Response: JSON with summary text, its template, doc reference, etc.
(Usually not needed if we get summary via doc, but could be handy for direct access or if we want to show summary alone in some context.)

POST /summaries/{summary_id}/publish – Publish a summary to an external integration.
Request: JSON with integration_id (or integration_type if we want to target whichever is connected of that type). Possibly additional metadata like for Slack, channel to post in (if not a fixed one). If publishing to something like Confluence, maybe a space or parent page ID if not predetermined. These could also be pre-configured in integration.config during setup.

Response: Possibly directly a success with some info: e.g., { "status": "success", "external_url": "https://app.notion.so/xyz" } if we do it synchronously. If publishing might take time or we want to retry on failure, it could be done asynchronously as a job as well. For consistency, and since some publications might involve multiple API calls, treating it as an async job is good. In that case, return a job_id and have the job handle it.

But given a single summary push is probably quick (one API call), we might attempt it immediately so the user gets a confirmation. If that call fails (network issue, etc.), we can return an error status. Alternatively, push to job for reliability (job can retry). Possibly do it sync in MVP for simplicity: call integration’s publish method and return result or error.

This endpoint allows the user to take action on the summaries, which is a key part of delivering value (getting the summary into their knowledge system). Because many users will want the summary in Notion or Guru for others to see
docs.unified.to
, this is an important API.

POST /documents/{doc_id}/publish – Alternative design: we could have a publish at document level (which might publish the latest summary or entire doc) depending on use case. But likely we publish summaries, so the above is fine.

Jobs and Status

GET /jobs/{job_id} – Get status of an asynchronous job.
Response: JSON with at least job_id, status, and if status=="completed", possibly a result or pointer to result. For example:

{ 
  "job_id": "abc123", 
  "job_type": "summarize_document", 
  "status": "completed", 
  "result": { "summary_id": 99 } 
}


Or if failed, include error_message. If still pending/in_progress, maybe an estimate or progress percentage if we have (we probably won’t for LLM tasks, except maybe number of chunks done out of total).

The frontend can poll this endpoint to know when to refresh something. In many cases though, the front-end might skip polling because we use WebSocket to notify. But polling is a good fallback if WebSocket is disconnected or not used.

GET /jobs – List recent jobs (optional).
Response: Could list jobs for the org, perhaps with filter query like ?status=pending or ?type=summarize_document. This might not be needed in UI, but could be useful for an admin dashboard or debugging (e.g., showing all tasks in progress). For MVP, not strictly required, but trivial to implement via Job table if needed.

Real-Time Endpoint

WebSocket /ws – Establish a real-time channel.
The client will open a WebSocket connection (e.g., using the JavaScript WebSocket API) to wss://ourapp.com/ws with authentication (we can require a query param token or do a token check after connect). Once connected, the server will send messages like:

{"event": "job_update", "job_id": "...", "status": "completed", "result": {...}}

Or more specific events: {"event": "summary_ready", "doc_id": 42, "summary_id": 99}.

We can also push integration events if needed: {"event": "doc_added", "doc": { ... }} if a new doc comes via background sync, to prompt UI update.

The exact schema of messages can be decided, but should be documented for the frontend. Possibly we have different message types for different purposes. Since this is not a REST endpoint per se, we just mention it:

Behavior: After connecting, client sends an authentication message (or token in the query string as ws://.../ws?token=abc). The server subscribes the connection to the user’s org channel. Then events related to that org or user are pushed. We’ll primarily use it for job completions and perhaps future collab notifications.

This real-time channel significantly improves UX by eliminating the need for constant polling and giving immediate feedback
hammadulhaq.medium.com
. We’ll implement it using FastAPI’s WebSocket support, and use something like an in-memory pub/sub or Redis pub/sub if multiple server instances.

Example Usage Flows:

To illustrate how these APIs work together for key scenarios:

User uploads a document and gets a summary:

POST /documents with file or text -> returns doc_id.

Frontend maybe directly calls POST /documents/{id}/summarize -> returns job_id.

Frontend either calls GET /jobs/{job_id} in a loop or waits on WebSocket.

Server sends WebSocket summary_ready when done (or client sees job status changed to completed).

Client then calls GET /documents/{id} or directly GET /summaries/{new_id} to get the content, and displays it.
(We could optimize by including the summary text in the WebSocket message itself, so the UI doesn’t even need a follow-up API call – but sending large text via WS is fine. Alternatively, the WS event could contain just an ID and the UI calls GET /summaries/id. Either way works.)

User connects an integration and imports docs:

Frontend shows "Connect Notion" -> user clicks -> frontend hits GET /integrations/notion/authorize -> get URL -> opens new window to Notion OAuth.

User authorizes, our /integrations/notion/callback gets called -> we store integration and possibly start sync.

The new window might redirect to a generic thank you page. Meanwhile, our server maybe created a job to import docs.

Back in the app (main window), the frontend either polls /integrations or, better, we send a WebSocket event "integration_connected" with integration details.

The user can then trigger import if not automatic: call POST /integrations/{id}/import?all=true -> returns job_id.

When done, a WS event "doc_added" might be emitted for each doc or at least at end.

The frontend refreshes the doc list (or we push them via events if we have their data).

The user sees the imported docs in their list, possibly marked as unsummarized. They can then click one and hit summarize, or we could have an option to auto-summarize all imported docs by queuing jobs for each (maybe controlled by a setting because doing many at once could be costly).

User publishes a summary to Notion:

User clicks “Publish to Notion” on a summary in the UI.

Frontend calls POST /summaries/{id}/publish with integration_id of their Notion integration.

If synchronous, this waits a second or two, calls Notion API, creates a page, returns success with URL. UI shows a link or confirmation.
If async, returns job_id, and we notify on completion similarly.

On success, maybe update the UI to mark that summary as published (we could even store that in PublishedDocuments table and reflect it).

User queries content (future Q&A feature):

Frontend calls POST /query with question.

Server uses Embeddings table to find top relevant chunks, constructs a prompt, calls LLM (maybe as a background job if it could be long). If quick, could do streaming response via WebSocket.

The answer is returned and displayed.
(This flow can reuse a lot of infrastructure we have: the Documents & Embeddings store, the LLM call logic, and either synchronous streaming or async job approach. Since not explicitly asked, just note that our architecture with background tasks and possibly streaming WS is well-suited to add this later.)

Throughout all APIs, we maintain a consistent data model and use IDs to link things. This makes it easier for a developer to follow and extend. For example, a junior dev can see that Document and Summary have a one-to-many via doc_id, and the API reflects that (with /documents/{id}/summaries etc.). The use of standard patterns (REST for CRUD, plus async for heavy tasks) means it’s straightforward to implement with FastAPI and SQLAlchemy (which can handle mapping these tables to Python classes, and we can use something like Alembic for migrations of this schema).

Conclusion

This comprehensive design provides a solid foundation for our LLM-powered documentation web app. We have defined a robust database schema that accounts for users, organizations, documents and their content, AI-generated summaries, custom templates, integration connections, and asynchronous job tracking. The schema emphasizes multi-tenant isolation
crunchydata.com
 while remaining flexible for new features (like more integrations or different AI tasks) in the future. Our choices (e.g., storing Unicode text in Postgres UTF-8) ensure we can handle any user content or “custom symbols” without issues
tigerdata.com
.

On the API side, we described a full set of RESTful endpoints covering authentication, document management, summarization workflow, template customization, and integration management. These APIs enable a frontend developer to build a feature-rich UI where everything is driven by these endpoints (no hard-coded data). For instance, the document list, detail view, and summary modals all get their data from our APIs, and user actions (like summarize or publish) map to the endpoints we specified. By following common conventions and patterns (like using background jobs for long tasks
testdriven.io
 and WebSockets for real-time feedback
hammadulhaq.medium.com
), the app will feel responsive and modern, similar to what users expect from current AI-powered products.

We also integrated insights from industry practices – using asynchronous task queues (like Celery) to handle LLM calls aligns with what many production systems do to scale AI workloads without degrading UX
testdriven.io
testdriven.io
. Implementing real-time updates via WebSockets mirrors the approach of next-gen AI applications that need continuous interactions or instantaneous updates
hammadulhaq.medium.com
hammadulhaq.medium.com
. For integrations, leveraging a unified API or existing open-source connectors (like Nango) means we can support a wide range of external platforms with minimal effort and focus on our core logic
docs.unified.to
nango.dev
. This extensible connector design ensures we can add new sources or allow custom ones, meeting the requirement for user-extensibility.

In summary, the design is fully comprehensive and geared towards a smooth user experience. Data is organized to minimize query complexity and latency, and the system uses async processing and real-time communication to keep the interface fast and dynamic. A junior developer reading this documentation should be able to implement the database tables in SQLAlchemy, set up the FastAPI routes for each endpoint, and tie in Celery workers for background tasks. By following this blueprint, they could build a production-ready web application that is scalable (at least in the near term), maintainable, and delightful for users – with the ability to summarize and manage documentation seamlessly, and integrate with the tools users already use. All design choices made here are backed by modern best practices and, where relevant, by external sources and precedent to ensure we’re not reinventing the wheel but standing on the shoulders of proven architectures.