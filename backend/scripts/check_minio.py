#!/usr/bin/env python3
"""
Script pour vérifier l'état du stockage MinIO
"""
import sys
import os
from pathlib import Path
import logging
from minio import Minio
from minio.error import S3Error

# Colors
GREEN = '\033[0;32m'
RED = '\033[0;31m'
YELLOW = '\033[1;33m'
BLUE = '\033[0;34m'
NC = '\033[0m'

# Ajouter le répertoire parent au path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import settings

def print_header(title: str):
    """Affiche un header formaté"""
    print("\n" + "=" * 80)
    print(f"  {BLUE}{title}{NC}")
    print("=" * 80)

def check_minio_connection():
    """Vérifie la connexion à MinIO"""
    print_header("CONNEXION MINIO")
    
    try:
        client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE
        )
        
        # Test de listage des buckets pour vérifier l'auth
        buckets = client.list_buckets()
        
        print(f"   {GREEN}✅ Connexion réussie!{NC}")
        print(f"   📍 Endpoint: {settings.MINIO_ENDPOINT}")
        print(f"   🔐 Secure: {settings.MINIO_SECURE}")
        print(f"   📦 Buckets trouvés: {len(buckets)}")
        
        return client, buckets
        
    except Exception as e:
        print(f"   {RED}❌ Erreur de connexion: {e}{NC}")
        return None, None

def check_buckets(client, buckets):
    """Vérifie l'état des buckets"""
    print_header("DÉTAILS DES BUCKETS")
    
    if not buckets:
        print(f"   {YELLOW}⚠️  Aucun bucket trouvé{NC}")
        return

    target_bucket = settings.MINIO_BUCKET_NAME
    found_target = False

    for bucket in buckets:
        marker = f"{GREEN}👉{NC}" if bucket.name == target_bucket else "  "
        creation_date = bucket.creation_date.strftime("%Y-%m-%d %H:%M:%S")
        print(f"   {marker} {bucket.name} (Créé le: {creation_date})")
        
        if bucket.name == target_bucket:
            found_target = True
            try:
                # Vérifier la policy
                policy = client.get_bucket_policy(bucket.name)
                print(f"      📜 Policy: {GREEN}Configurée{NC}")
            except S3Error as e:
                if e.code == 'NoSuchBucketPolicy':
                    print(f"      📜 Policy: {YELLOW}Non configurée (Privé){NC}")
                else:
                    print(f"      📜 Policy: {RED}Erreur ({e.code}){NC}")
            except Exception:
                print(f"      📜 Policy: {YELLOW}Non accessible{NC}")

            # Lister quelques objets
            try:
                objects = list(client.list_objects(bucket.name, recursive=True))
                count = len(objects)
                size = sum(obj.size for obj in objects)
                size_mb = size / (1024 * 1024)
                print(f"      📄 Objets: {count}")
                print(f"      💾 Taille totale: {size_mb:.2f} MB")
            except Exception as e:
                print(f"      ❌ Erreur listing objets: {e}")

    if not found_target:
        print(f"\n   {RED}❌ Le bucket cible '{target_bucket}' n'existe pas!{NC}")
        print(f"   💡 Il devrait être créé automatiquement au démarrage du backend.")

def main():
    """Fonction principale"""
    print("\n" + "=" * 80)
    print(f"{BLUE}📦 CARLITOS COACH - MinIO Storage Check{NC}")
    print("=" * 80)
    
    client, buckets = check_minio_connection()
    
    if client:
        check_buckets(client, buckets)
    
    print("\n" + "=" * 80)
    print(f"{GREEN}✅ Vérification terminée!{NC}")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()
