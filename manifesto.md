🧠 SYSTEM MANIFESTO: NASKAUS ECOSYSTEM (v2.2)
Dernière mise à jour : 17 Février 2026
Statut : Production Stable - Backup Universel Automatisé (Google Drive) actif.
Mainteneur : GEM (Senior DevOps / SRE)
1. ARCHITECTURE RÉSEAU (Zero-Trust)
Host : Raspberry Pi 5 (16GB).
Kernel : Linux 6.12.47+rpt-rpi-2712 (Debian/Raspbian).
IP Privée (Tailscale) : 100.119.245.18 (Unique accès SSH/Admin).
Accès Public : Cloudflare Tunnels (cloudflared). Aucun port ouvert sur la box internet.
DNS : Géré par Cloudflare avec SSL Full/Strict.
























2. INVENTAIRE DES SERVICES (MAP CLOUDFLARE & DISQUE)
Service / App
Domaine public
Port Interne
Tech Stack / Statut
Emplacement / Notes
Seb Portal
naskaus.com

admin.naskaus.com
8080
Docker (seb_portal_v5)
Site vitrine principal.
+1
Digital Shadow
staff.naskaus.com
8001
FastAPI + React (Systemd)
App de gestion (v0.3).
+1
Tasks App
tasks.naskaus.com
8002
Flask + Gunicorn (Systemd)
Inclut Queen's Night & Party Planner.
+1
Aperipommes
aperipommes.naskaus.com
8003
App Web
/var/www/aperipommes/
The4th
the4th.naskaus.com
8004
App Web
/var/www/the4th/
Panties Fan
pantiesfan.com
8005
App Web
/var/www/panties-fan/
Agency App
agency.naskaus.com
8006 (api)

3006 (web)
App Web
/var/www/agency-app/
Meet Beyond
meetbeyond.naskaus.com
8007
App Web
/var/www/meet-beyond/
Marifah
marifah.naskaus.com
8010
App Web
/var/www/marifah/
n8n
Local Only
5678
Docker + Postgres 16
Automation interne.
+1
Moltbot / Perfs
Non exposé
N/A
Fichiers statiques/Scripts
/var/www/moltbot/, /var/www/performances/















3. EMPLACEMENTS CRITIQUES SUR LE DISQUE
Applications Web : Tous les projets sont centralisés dans /var/www/.
Bases de données :
Postgres 17 : Instance système (Service postgresql) -> Utilisée par Digital Shadow.
Postgres 16 : Instance Docker (n8n-postgres-1) -> Utilisée par n8n.
Infrastructure & Backups :
Cloudflare Ingress : ~/.cloudflared/f661a430...json (Définit le routage public).
Rclone Config : /root/.config/rclone/rclone.conf (Pont vers Google Drive).
Script de Backup : /usr/local/bin/naskaus_backup.sh (Exécutable).

4. PROTOCOLES DE MAINTENANCE & RÈGLES D'OR
Modifications de Prod : Toujours vérifier les migrations Alembic avant de modifier la base de données.
Environnements Python : Utiliser systématiquement les venv situés dans les dossiers respectifs pour éviter les conflits.
Propreté du Serveur : Ne jamais stocker de dossiers de backup manuels (*OLD*, *backup*) dans /var/www/ pour ne pas saturer le disque et ralentir l'upload cloud.

5. ARSENAL DE BACKUP (THE "GOLDEN ARCHIVE")
Le système est protégé par un script d'automatisation (Cron) qui s'exécute avec les privilèges root.
Fréquence : Tous les dimanches à 03h00 AM (0 3 * * 0).
Destination : Google Drive (Remote: gdrive, Dossier: Pi5_Backups).
Contenu de l'Archive (Exclut node_modules et venv) :
Dump SQL de digital_shadow (Système).
Dump SQL de n8n (Docker).
Compression intégrale de /var/www/ (Couvrant les 9+ projets actifs).
Logs : Consultables via cat /var/log/naskaus_backup.log.







6. DISASTER RECOVERY PROTOCOL (Comment Restaurer)
Si le Raspberry Pi 5 subit une défaillance critique (incendie, crash disque):
Étape 1 : Récupérer l'Archive Télécharger la dernière archive .tar.gz depuis le dossier Pi5_Backups sur Google Drive.
+1
Étape 2 : Restaurer les Fichiers
Bash
# Sur le nouveau serveur, extraire à la racine
sudo tar -xzvf naskaus_prod_full_YYYYMMDD.tar.gz -C /
Étape 3 : Restaurer les Bases de données
Bash
# Digital Shadow (System Postgres)
sudo -u postgres psql -U postgres -d digital_shadow < /tmp/naskaus_backup/digital_shadow_prod.sql

# n8n (Docker Postgres)
cat /tmp/naskaus_backup/n8n_backup.sql | docker exec -i n8n-postgres-1 psql -U n8n
Étape 4 : Réinstaller les Dépendances (Omises du backup)
Bash
cd /var/www/digital-shadow/backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
cd /var/www/digital-shadow/frontend && npm install
# (Répéter pour l'Agency App, Tasks, etc.)

