# Phishing & Email Header Analysis Tool

An interactive, browser-based email analysis and header inspection utility designed to help security analysts, SOC responders, and abuse desk teams parse, analyze, and extract indicators of compromise (IoCs) from suspicious messages.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

Phishing remains the primary initial access vector for security breaches. Triaging user-reported suspicious emails requires dissecting raw MIME headers, tracing transit hops, checking authentication records (SPF, DKIM, DMARC), and extracting embedded URLs and file hashes without accidentally interacting with malicious infrastructure.

The **Email Analysis Tool** (`index.html`) provides a lightweight, client-side triage environment to paste and inspect raw email headers and message content directly in the browser—speeding up investigation workflows without sending message contents to third-party web tools.

---

## 🔍 Header & Authentication Inspection Flow

```text
  [ Raw Email Headers / MIME Body ]
                 │
                 ▼
  [ Header Parsing & Normalization ]
  (Message-ID, Date, Subject, Return-Path)
                 │
                 ▼
  [ Authentication Verification ]
  (SPF: Pass/Fail/Softfail | DKIM: Signatures | DMARC: Alignment)
                 │
                 ▼
  [ Transit Hop Breakdown (Received Lines) ]
  (Relay Delays, Connecting IP, Reverse DNS, Originating Server)
                 │
                 ▼
  [ IoC Defanging & Extraction ]
  (URLs, Embedded IP Addresses, Domain Extractions)
