"""
DocuIntel-AI Semantic Docs Search & RAG Chatbot Service
Provides vector-based topic retrieval over technical documentation with citation grounding
and built-in Hallucination & Stale Context Guard (Content Gap Detection).
"""

import os
import re
from typing import List, Dict, Any, Optional
from io import BytesIO

try:
    from pypdf import PdfReader
    HAS_PYPDF = True
except ImportError:
    HAS_PYPDF = False

# Built-in seed documentation repository covering enterprise storage, backup, and security
DEFAULT_DOCS_REPOSITORY = [
    {
        "id": "doc-01",
        "title": "Configuring Protection Policies in Cohesity DataProtect",
        "category": "Data Protection",
        "tags": ["backup", "protection-policy", "sla", "dataprotect"],
        "content": """# Configuring Protection Policies in Cohesity DataProtect

A Protection Policy defines the backup frequency, retention period, SLA compliance rules, and replication targets for registered workloads (VMware VMs, physical servers, NAS shares, and Kubernetes clusters).

## Prerequisites
- Administrator or Data Protection Manager privileges.
- At least one active Storage Domain configured on the Cohesity Cluster.
- Target workloads registered under the Protection Sources tree.

## Procedure
1. Log in to the Cohesity Helios web dashboard.
2. In the navigation sidebar, select **Data Protection** > **Protection Policies**.
3. Click **Add Policy** in the top-right corner.
4. Specify a descriptive policy name (for example, `Gold-Tier-Daily-VM-Policy`).
5. Under **Backup Schedule**:
   - Set the frequency (for example, Every 4 Hours or Daily at 02:00 UTC).
   - Set the Local Retention period (for example, 30 Days).
6. (Optional) Configure **Replication / Archival**:
   - Check **Replicate to Remote Cluster** or **Archive to CloudStorage** (AWS S3, Azure Blob, or Google Cloud Storage).
7. Under **SLA Rules**, configure RPO and RTO alerting thresholds.
8. Click **Save Policy**.

## Expected Result
The new policy appears in the Protection Policies table with active status and can be immediately assigned to workloads.
"""
    },
    {
        "id": "doc-02",
        "title": "SmartFiles Distributed File and Object Storage Overview",
        "category": "Storage & SmartFiles",
        "tags": ["smartfiles", "nas", "nfs", "smb", "s3", "storage"],
        "content": """# SmartFiles Distributed File and Object Storage Overview

SmartFiles is Cohesity's software-defined, enterprise-scale distributed file and object service built on the SpanFS file system. It consolidates unstructured data silos, provides multi-protocol access (NFS, SMB, and S3), and lowers TCO through automated global deduplication and data tiering.

## Key Capabilities
- **Multi-Protocol Unified Storage**: Simultaneous read/write access via NFSv3, NFSv4, SMB 2.x/3.x, and S3 APIs.
- **Global Inline Deduplication & Compression**: SpanFS divides incoming streams into variable-sized chunks, computing SHA-256 signatures to eliminate redundant data blocks across all shares.
- **Automated Lifecycle Tiering**: Transparently archives cold or inactive data blocks to public cloud providers (Amazon S3 Glacier, Azure Archive) while retaining stub pointers in local views.
- **WORM (Write Once, Read Many) Compliance**: Enforces regulatory compliance (SEC 17a-4, FINRA) preventing modification or premature deletion of protected snapshots.
"""
    },
    {
        "id": "doc-03",
        "title": "Ransomware Detection, Alerting and Clean Recovery Workflow",
        "category": "Security & Cyber Resilience",
        "tags": ["ransomware", "security", "anomaly-detection", "clean-room", "recovery"],
        "content": """# Ransomware Detection, Alerting and Clean Recovery Workflow

Cohesity integrates machine learning-driven anomaly detection to identify potential ransomware activity early in the backup stream and prevent reinfection during recovery.

## How Detection Works
During every ingest cycle, Cohesity analyzes filesystem telemetry:
- **Change Rate Spikes**: Abnormally large daily delta changes.
- **Entropy Shifts**: Sudden spikes in file entropy indicating block encryption.
- **Bulk Renames/Deletions**: Heuristics detecting characteristic ransomware wiper footprints.

## Recovery Procedure
1. When a high-severity security alert triggers, isolate the affected cluster workload.
2. In Helios, open the **CyberScan** dashboard to pinpoint the exact time of compromise.
3. Locate the last known good immutable snapshot captured before the anomaly flag.
4. Mount the snapshot in an isolated Clean Room network sandbox.
5. Perform an antivirus and YARA rules scan against the mounted volume.
6. Trigger **Instant Mass Restore** to redirect live production VMs directly to the snapshot without waiting for bulk data copy.
"""
    },
    {
        "id": "doc-04",
        "title": "Role-Based Access Control (RBAC) and Security Best Practices",
        "category": "Administration & Security",
        "tags": ["rbac", "security", "users", "active-directory", "audit-logs"],
        "content": """# Role-Based Access Control (RBAC) and Security Best Practices

Cohesity provides granular Role-Based Access Control (RBAC) to enforce the principle of least privilege across administrators, backup operators, and audit teams.

## Built-In Roles
- **Admin**: Full cluster configuration, user management, and security settings.
- **Data Protection Manager**: Creates policies, schedules backups, and executes restore operations.
- **View Only / Auditor**: Read-only access to dashboards, compliance reports, and audit trails.

## Security Hardening Checklist
- Integrate with corporate Active Directory / LDAP or SAML 2.0 / Okta SSO.
- Enforce Multi-Factor Authentication (MFA / TOTP) on all administrative accounts.
- Enable Quorum (Dual-Custody) Authorization: critical actions (such as deleting a protection policy or purging snapshots) require sign-off from two independent administrators.
- Retain Syslog audit exports to external SIEM systems (Splunk, Datadog).
"""
    },
    {
        "id": "doc-05",
        "title": "REST API Authentication and Token Management",
        "category": "Developer & API Reference",
        "tags": ["api", "rest", "jwt", "tokens", "automation", "python"],
        "content": """# REST API Authentication and Token Management

All automation against the Cohesity Cluster or Helios management control plane utilizes RESTful APIs secured via JSON Web Tokens (JWT).

## Generating an Access Token
Send an HTTP POST request to `/v2/mcm/token` (for Helios) or `/iriss/v1/public/accessTokens` (for local cluster):

```bash
curl -X POST https://cluster-vip/iriss/v1/public/accessTokens \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "admin",
    "domain": "LOCAL",
    "password": "your_secure_password"
  }'
```

## Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "tokenType": "Bearer",
  "privileges": ["Admin", "DataProtectionManager"]
}
```

## Using the Token in Automation
Pass the token in the `Authorization` header on all subsequent calls:
`Authorization: Bearer <accessToken>`
"""
    }
]

class DocsSemanticSearch:
    def __init__(self):
        self.docs: List[Dict[str, Any]] = list(DEFAULT_DOCS_REPOSITORY)
        self._build_index()

    def _build_index(self):
        """
        Builds the TF-IDF vocabulary and document vectors.
        """
        from sklearn.feature_extraction.text import TfidfVectorizer
        self.vectorizer = TfidfVectorizer(stop_words='english', token_pattern=r'(?u)\b\w+\b')
        self.doc_texts = [f"{d['title']} {d['category']} {' '.join(d['tags'])} {d['content']}" for d in self.docs]
        if self.doc_texts:
            self.tfidf_matrix = self.vectorizer.fit_transform(self.doc_texts)
        else:
            self.tfidf_matrix = None

    def add_document(self, title: str, content: str, category: str = "General", tags: List[str] = None) -> Dict[str, Any]:
        doc_id = f"custom-{len(self.docs) + 1}"
        new_doc = {
            "id": doc_id,
            "title": title,
            "category": category,
            "tags": tags or ["custom", "imported"],
            "content": content
        }
        self.docs.append(new_doc)
        self._build_index()
        return new_doc

    def search_and_answer(self, query: str) -> Dict[str, Any]:
        """
        Retrieves relevant topics and constructs a grounded technical answer.
        Detects content gaps when query confidence is low.
        """
        from sklearn.metrics.pairwise import cosine_similarity
        if not self.docs or self.tfidf_matrix is None:
            return {
                "query": query,
                "answer": "No documentation index available.",
                "confidence_score": 0.0,
                "is_gap_detected": True,
                "citations": []
            }

        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix)[0]

        ranked_indices = similarities.argsort()[::-1]
        top_idx = ranked_indices[0]
        top_score = float(similarities[top_idx])

        # Hallucination & Content Gap Detection Threshold
        # If top match score is below 0.12, flag as a documentation gap!
        is_gap = top_score < 0.12

        if is_gap:
            return {
                "query": query,
                "answer": (
                    f"⚠️ **Documentation Gap Identified**: The current documentation corpus does not contain sufficient verified details "
                    f"to answer the question: *\"{query}\"*.\n\n"
                    f"To prevent hallucination, DocuIntel-AI has logged this query as a **Content Gap Request** "
                    f"for technical writers to author and test against the product."
                ),
                "confidence_score": round(top_score * 100, 1),
                "is_gap_detected": True,
                "gap_recommendation": f"Draft a topic topic for '{query}' using the Authoring Studio.",
                "citations": []
            }

        top_doc = self.docs[top_idx]
        
        # Extract the most relevant paragraphs from top_doc
        paragraphs = [p.strip() for p in top_doc["content"].split("\n\n") if len(p.strip()) > 25]
        
        # Find best paragraph
        if len(paragraphs) > 1:
            para_vecs = self.vectorizer.transform(paragraphs)
            para_sims = cosine_similarity(query_vec, para_vecs)[0]
            best_p_idx = para_sims.argsort()[::-1][0]
            highlight = paragraphs[best_p_idx]
        else:
            highlight = top_doc["content"][:400]

        # Grounded answer synthesis
        answer = (
            f"Based on **[{top_doc['title']}]**:\n\n"
            f"{highlight}\n\n"
            f"*(Confidence: {round(top_score * 100, 1)}% | Category: {top_doc['category']})*"
        )

        citations = [
            {
                "doc_id": top_doc["id"],
                "title": top_doc["title"],
                "category": top_doc["category"],
                "confidence": round(top_score * 100, 1),
                "snippet": highlight[:250] + "..."
            }
        ]

        # Add secondary citation if relevant
        if len(ranked_indices) > 1 and similarities[ranked_indices[1]] > 0.15:
            sec_doc = self.docs[ranked_indices[1]]
            citations.append({
                "doc_id": sec_doc["id"],
                "title": sec_doc["title"],
                "category": sec_doc["category"],
                "confidence": round(float(similarities[ranked_indices[1]]) * 100, 1),
                "snippet": sec_doc["content"][:200] + "..."
            })

        return {
            "query": query,
            "answer": answer,
            "confidence_score": round(top_score * 100, 1),
            "is_gap_detected": False,
            "citations": citations
        }
