# Cyber Kill Chain Planner

An interactive, browser-based defensive modeling and planning utility designed to map adversary actions, evaluate detection and prevention controls, and identify defensive gaps across the Lockheed Martin Cyber Kill Chain®.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

Stopping advanced threats requires defense-in-depth: breaking the adversary's progression as early as possible in their campaign lifecycle. If an attacker bypasses perimeter delivery, security teams must rely on endpoint exploitation mitigations, command-and-control disruptions, or lateral movement barriers.

The **Cyber Kill Chain Planner** (`index.html`) gives security architects, threat analysts, and detection engineers an interactive canvas to walk through each phase of an attack. Teams can plot adversary activities, map existing defensive controls (Detect, Deny, Disrupt, Degrade, Deceive, Destroy), and quickly spot where detection or mitigation visibility is weak.

---

## ⛓️ Kill Chain Phase Coverage

```text
 [1. Reconnaissance] ──> [2. Weaponization] ──> [3. Delivery]
                                                    │
                                                    ▼
 [6. Command & Control] <── [5. Installation] <── [4. Exploitation]
           │
           ▼
 [7. Actions on Objectives] (Exfiltration, Encryption, Tampering)
