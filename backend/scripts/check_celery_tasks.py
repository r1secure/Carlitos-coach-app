#!/usr/bin/env python3
"""
Script pour vérifier l'état des tâches Celery
"""
import sys
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, List
import logging

# Colors
GREEN = '\033[0;32m'
RED = '\033[0;31m'
YELLOW = '\033[1;33m'
BLUE = '\033[0;34m'
NC = '\033[0m'

# Désactiver les logs verbeux pour une sortie propre
logging.basicConfig(level=logging.ERROR)
for logger_name in ['celery', 'kombu', 'amqp', 'redis']:
    logging.getLogger(logger_name).setLevel(logging.ERROR)
    logging.getLogger(logger_name).propagate = False

# Ajouter le répertoire parent au path
sys.path.insert(0, str(Path(__file__).parent.parent))

from celery.result import AsyncResult
from celery_app import celery_app


def print_header(title: str):
    """Affiche un header formaté"""
    print("\n" + "=" * 80)
    print(f"  {BLUE}{title}{NC}")
    print("=" * 80)


def get_registered_tasks():
    """Liste toutes les tâches enregistrées dans Celery"""
    print_header("TÂCHES ENREGISTRÉES")
    
    tasks = list(celery_app.tasks.keys())
    # Filtrer les tâches système Celery
    user_tasks = [t for t in tasks if not t.startswith('celery.')]
    
    print(f"   Total: {len(user_tasks)} tâches utilisateur\n")
    for task in sorted(user_tasks):
        print(f"     - {task}")


def check_active_tasks():
    """Vérifie les tâches actuellement en cours d'exécution"""
    print_header("TÂCHES EN COURS D'EXÉCUTION")
    
    try:
        # Inspecter les workers actifs
        inspect = celery_app.control.inspect()
        
        # Tâches actives
        active = inspect.active()
        if active:
            total_active = sum(len(tasks) for tasks in active.values())
            print(f"   Total: {total_active} tâche(s) active(s)\n")
            
            for worker, tasks in active.items():
                if tasks:
                    print(f"   Worker: {worker}")
                    for task in tasks:
                        task_name = task.get('name', 'Unknown')
                        task_id = task.get('id', 'Unknown')
                        args = task.get('args', [])
                        print(f"     ├─ Task: {task_name}")
                        print(f"     ├─ ID: {task_id}")
                        print(f"     └─ Args: {args}")
                        print()
        else:
            print(f"   {YELLOW}⚠️  Aucun worker actif trouvé{NC}")
            print("   → Vérifier que le worker Celery est lancé:")
            print("      docker-compose ps celery-worker")
            
    except Exception as e:
        print(f"   {RED}❌ Erreur: {e}{NC}")


def check_reserved_tasks():
    """Vérifie les tâches réservées (en attente d'exécution)"""
    print_header("TÂCHES RÉSERVÉES (EN ATTENTE)")
    
    try:
        inspect = celery_app.control.inspect()
        reserved = inspect.reserved()
        
        if reserved:
            total_reserved = sum(len(tasks) for tasks in reserved.values())
            print(f"   Total: {total_reserved} tâche(s) réservée(s)\n")
            
            for worker, tasks in reserved.items():
                if tasks:
                    print(f"   Worker: {worker}")
                    for task in tasks:
                        task_name = task.get('name', 'Unknown')
                        task_id = task.get('id', 'Unknown')
                        print(f"     ├─ Task: {task_name}")
                        print(f"     └─ ID: {task_id}")
                        print()
        else:
            print(f"   {GREEN}✅ Aucune tâche réservée{NC}")
            
    except Exception as e:
        print(f"   {RED}❌ Erreur: {e}{NC}")


def check_scheduled_tasks():
    """Vérifie les tâches planifiées (scheduled)"""
    print_header("TÂCHES PLANIFIÉES")
    
    try:
        inspect = celery_app.control.inspect()
        scheduled = inspect.scheduled()
        
        if scheduled:
            total_scheduled = sum(len(tasks) for tasks in scheduled.values())
            print(f"   Total: {total_scheduled} tâche(s) planifiée(s)\n")
            
            for worker, tasks in scheduled.items():
                if tasks:
                    print(f"   Worker: {worker}")
                    for task in tasks:
                        task_name = task.get('name', 'Unknown')
                        task_id = task.get('request', {}).get('id', 'Unknown')
                        eta = task.get('eta', 'Unknown')
                        print(f"     ├─ Task: {task_name}")
                        print(f"     ├─ ID: {task_id}")
                        print(f"     └─ ETA: {eta}")
                        print()
        else:
            print(f"   {GREEN}✅ Aucune tâche planifiée{NC}")
            
    except Exception as e:
        print(f"   {RED}❌ Erreur: {e}{NC}")


def check_worker_stats():
    """Affiche les statistiques des workers"""
    print_header("STATISTIQUES WORKERS")
    
    try:
        inspect = celery_app.control.inspect()
        stats = inspect.stats()
        
        if stats:
            print(f"   Nombre de workers: {len(stats)}\n")
            
            for worker, stat in stats.items():
                print(f"   Worker: {worker}")
                print(f"     ├─ Pool: {stat.get('pool', {}).get('implementation', 'Unknown')}")
                print(f"     ├─ Max concurrency: {stat.get('pool', {}).get('max-concurrency', 'Unknown')}")
                print(f"     ├─ Total tasks: {stat.get('total', {})}")
                
                # Broker info
                broker = stat.get('broker', {})
                if broker:
                    print(f"     └─ Broker: {broker.get('hostname', 'Unknown')}")
                print()
        else:
            print(f"   {YELLOW}⚠️  Aucun worker trouvé{NC}")
            
    except Exception as e:
        print(f"   {RED}❌ Erreur: {e}{NC}")


def check_redis_queue():
    """Vérifie l'état de la queue Redis directement"""
    print_header("ÉTAT DE LA QUEUE REDIS")
    
    try:
        # Obtenir la connexion Redis depuis Celery
        from kombu import Connection
        
        with Connection(celery_app.conf.broker_url) as conn:
            channel = conn.channel()
            
            # Queue par défaut
            queue_name = 'celery'
            
            try:
                # Obtenir le nombre de messages dans la queue
                queue = channel.queue_declare(queue=queue_name, passive=True)
                message_count = queue.message_count
                
                print(f"   Queue: {queue_name}")
                print(f"     └─ Messages en attente: {message_count}")
                
                if message_count > 0:
                    print(f"\n   {YELLOW}⚠️  {message_count} message(s) en attente d'être traité(s){NC}")
                    print("   → Vérifier que le worker Celery est actif")
                else:
                    print(f"\n   {GREEN}✅ Aucun message en attente{NC}")
                    
            except Exception as e:
                print(f"   {YELLOW}⚠️  Queue '{queue_name}' non trouvée ou vide{NC}")
                
    except Exception as e:
        print(f"   {RED}❌ Erreur de connexion Redis: {e}{NC}")


def check_failed_tasks():
    """Vérifie les tâches en échec"""
    print_header("DIAGNOSTIC DES ÉCHECS")
    
    try:
        # Cette fonctionnalité nécessite un result backend configuré
        # On va essayer de récupérer des infos depuis le inspect
        inspect = celery_app.control.inspect()
        
        # Tâches révoquées
        revoked = inspect.revoked()
        if revoked:
            total_revoked = sum(len(tasks) for tasks in revoked.values())
            if total_revoked > 0:
                print(f"   {YELLOW}⚠️  {total_revoked} tâche(s) révoquée(s){NC}")
            else:
                print(f"   {GREEN}✅ Aucune tâche révoquée{NC}")
        else:
            print(f"   {GREEN}✅ Aucune tâche révoquée{NC}")
            
    except Exception as e:
        print(f"   {RED}❌ Erreur: {e}{NC}")


def get_task_recommendations():
    """Donne des recommandations basées sur l'état"""
    print_header("RECOMMANDATIONS")
    
    try:
        inspect = celery_app.control.inspect()
        
        # Vérifier si des workers sont actifs
        stats = inspect.stats()
        active = inspect.active()
        
        recommendations = []
        
        if not stats:
            recommendations.append(
                f"{YELLOW}⚠️  Aucun worker Celery détecté{NC}\n"
                "   → Lancer le worker: docker-compose up celery-worker\n"
                "   → Vérifier les logs: docker-compose logs celery-worker"
            )
        
        if stats and not active:
            # Workers actifs mais aucune tâche
            recommendations.append(
                f"{GREEN}✅ Workers prêts à traiter des tâches{NC}\n"
                "   → Les tâches seront traitées dès leur soumission"
            )
        
        # Vérifier la connexion Redis
        try:
            from kombu import Connection
            with Connection(celery_app.conf.broker_url) as conn:
                conn.ensure_connection(max_retries=1)
            recommendations.append(f"{GREEN}✅ Connexion Redis OK{NC}")
        except Exception:
            recommendations.append(
                f"{RED}❌ Problème de connexion Redis{NC}\n"
                "   → Vérifier que Redis est lancé: docker-compose ps redis\n"
                "   → Vérifier REDIS_URL dans .env"
            )
        
        if recommendations:
            for rec in recommendations:
                print(f"   {rec}\n")
        else:
            print(f"   {GREEN}✅ Tout semble en ordre!{NC}")
            
    except Exception as e:
        print(f"   {RED}❌ Erreur: {e}{NC}")


def main():
    """Fonction principale"""
    print("\n" + "=" * 80)
    print(f"{BLUE}📋 CARLITOS COACH - Celery Tasks Check{NC}")
    print("=" * 80)
    
    # Vérifications
    get_registered_tasks()
    check_worker_stats()
    check_active_tasks()
    check_reserved_tasks()
    check_scheduled_tasks()
    check_redis_queue()
    check_failed_tasks()
    get_task_recommendations()
    
    print("\n" + "=" * 80)
    print(f"{GREEN}✅ Vérification terminée!{NC}")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    main()
