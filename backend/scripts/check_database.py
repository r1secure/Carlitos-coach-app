#!/usr/bin/env python3
"""
Script pour vérifier l'état de la base de données Carlitos Coach
"""
import sys
import os
from pathlib import Path
import logging

# Colors
GREEN = '\033[0;32m'
RED = '\033[0;31m'
YELLOW = '\033[1;33m'
BLUE = '\033[0;34m'
NC = '\033[0m'

# Désactiver complètement les logs SQLAlchemy pour une sortie propre
logging.basicConfig(level=logging.ERROR)
for logger_name in ['sqlalchemy.engine', 'sqlalchemy.pool', 'sqlalchemy.dialects', 'sqlalchemy.orm']:
    logging.getLogger(logger_name).setLevel(logging.ERROR)
    logging.getLogger(logger_name).propagate = False
os.environ['SQLALCHEMY_WARN_20'] = '0'

# Ajouter le répertoire parent au path pour importer les modules de l'app
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from config import settings
from models.drill import Drill
from models.user import User

# Créer un engine sans logs pour une sortie propre
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,  # Désactive complètement les logs SQL
    pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def print_section(emoji: str, number: int, title: str):
    """Affiche un header de section formaté"""
    print(f"\n{BLUE}{emoji} {number}. {title}{NC}")
    print()


def check_database_connection():
    """Vérifie la connexion à la base de données"""
    print_section("📊", 1, "Vérification de la connexion à la base de données...")
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            # Extraire juste la version courte
            version_short = version.split(' on ')[0] if ' on ' in version else version
            print(f"   {GREEN}✅ Connexion réussie!{NC}")
            print(f"   📍 Serveur: {engine.url.host}:{engine.url.port}")
            print(f"   🗄️  Base de données: {engine.url.database}")
            print(f"   🐘 Version: {version_short}")
            return True
    except Exception as e:
        print(f"   {RED}❌ Erreur de connexion: {e}{NC}")
        return False


def list_databases():
    """Liste toutes les bases de données disponibles"""
    print_section("📋", 2, "Liste des bases de données disponibles:")
    try:
        db = SessionLocal()
        result = db.execute(text("""
            SELECT datname, pg_size_pretty(pg_database_size(datname)) as size
            FROM pg_database 
            WHERE datistemplate = false 
            ORDER BY datname
        """))
        
        databases = result.fetchall()
        current_db = engine.url.database
        
        for db_info in databases:
            marker = f"{GREEN}👉{NC}" if db_info.datname == current_db else "  "
            print(f"   {marker} {db_info.datname} ({db_info.size})")
        
        db.close()
    except Exception as e:
        print(f"   {RED}❌ Erreur: {e}{NC}")


def check_tables():
    """Vérifie les tables de la base de données"""
    print_section("📊", 3, "Vérification des tables...")
    
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    if tables:
        print(f"   {GREEN}✅ {len(tables)} table(s) trouvée(s){NC}")
        print()
        for table in sorted(tables):
            # Compter les enregistrements
            try:
                db = SessionLocal()
                count = db.execute(text(f"SELECT COUNT(*) FROM {table}")).fetchone()[0]
                db.close()
                print(f"      • {table:<25} ({count} enregistrement(s))")
            except:
                print(f"      • {table:<25} (impossible de compter)")
    else:
        print(f"   {YELLOW}⚠️  Aucune table trouvée{NC}")


def show_table_details():
    """Affiche les détails des tables"""
    print_section("📊", 4, "Détails des tables existantes:")
    
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    # Tables importantes à détailler
    important_tables = ['users', 'drills', 'drill_tags', 'drill_videos', 'content_versions']
    
    for table in important_tables:
        if table in tables:
            print(f"   📄 Table: {BLUE}{table}{NC}")
            
            # Colonnes
            columns = inspector.get_columns(table)
            print(f"      Colonnes ({len(columns)}):")
            for col in columns[:8]:  # Limiter à 8 colonnes pour la lisibilité
                nullable = "NULL" if col['nullable'] else "NOT NULL"
                col_type = str(col['type'])
                print(f"         - {col['name']:<20} {col_type:<20} {nullable}")
            
            if len(columns) > 8:
                print(f"         ... et {len(columns) - 8} autres colonnes")
            
            # Primary keys
            pk = inspector.get_pk_constraint(table)
            if pk and pk['constrained_columns']:
                print(f"      Clé primaire: {', '.join(pk['constrained_columns'])}")
            
            # Foreign keys
            fks = inspector.get_foreign_keys(table)
            if fks:
                print(f"      Clés étrangères ({len(fks)}):")
                for fk in fks[:3]:  # Limiter à 3 FK
                    print(f"         - {', '.join(fk['constrained_columns'])} → {fk['referred_table']}")
            
            # Indexes
            indexes = inspector.get_indexes(table)
            if indexes:
                print(f"      Index: {len(indexes)} index")
            
            print()


def count_records_by_table():
    """Compte les enregistrements par table avec détails"""
    print_section("🔢", 5, "Nombre d'enregistrements par table:")
    
    db = SessionLocal()
    
    try:
        # Users
        try:
            user_count = db.query(User).count()
            print(f"   👥 Utilisateurs: {user_count}")
            if user_count > 0:
                 # Stats par role
                roles = db.execute(text("""
                    SELECT role, COUNT(*) as count 
                    FROM users 
                    GROUP BY role 
                    ORDER BY count DESC
                """))
                roles_list = [f"{row.role} ({row.count})" for row in roles]
                if roles_list:
                    print(f"      Rôles: {', '.join(roles_list)}")

                # Print all user fields
                users = db.query(User).all()
                if users:
                    print(f"\n   👥 Détails des utilisateurs ({len(users)}):")
                    for user in users:
                        print(f"      - {user.full_name} ({user.email})")
                        print(f"        Role: {user.role}")
                        print(f"        Active: {user.is_active}")
                        print(f"        Profile: First={user.first_name}, Last={user.last_name}, Rank={user.ranking}, Hand={user.handedness}, Backhand={user.backhand_style}")
                else:
                    print("\n   👥 Aucun utilisateur trouvé.")

        except Exception as e:
            print(f"   {YELLOW}👥 Utilisateurs: Table non accessible ou vide ({e}){NC}")

        print()

        # Drills
        drill_count = db.query(Drill).count()
        drill_active = db.query(Drill).filter(Drill.deleted_at.is_(None)).count()
        drill_deleted = drill_count - drill_active
        
        print(f"   🎾 Drills:")
        print(f"      Total: {drill_count}")
        print(f"      ├─ Actifs: {drill_active}")
        print(f"      └─ Supprimés (soft delete): {drill_deleted}")
        
        if drill_active > 0:
            # Stats par difficulté
            difficulties = db.execute(text("""
                SELECT difficulty, COUNT(*) as count 
                FROM drills 
                WHERE deleted_at IS NULL 
                GROUP BY difficulty 
                ORDER BY count DESC
                LIMIT 3
            """))
            diff_list = [f"{row.difficulty or 'Non défini'} ({row.count})" for row in difficulties]
            if diff_list:
                print(f"      Difficultés: {', '.join(diff_list)}")
        
        # Vidéos
        # Using raw SQL for video count since DrillVideo model is not available
        video_count = db.execute(text("SELECT COUNT(*) FROM drill_videos")).fetchone()[0]
        print(f"\n   📹 Vidéos (Associations):")
        print(f"      Total: {video_count}")
        
        # URLs
        if video_count > 0:
            drills_with_video = db.query(Drill).count() # This logic was flawed in original script, simplified
            # Just checking minio links in metadata if possible, but Drill model doesn't have video_url
            # It seems video_url was removed or I misread the model. 
            # Checking Drill model again: it has 'videos' relationship.
            pass
        
        # Content versions
        try:
            versions_count = db.execute(text("SELECT COUNT(*) FROM content_versions")).fetchone()[0]
            if versions_count > 0:
                print(f"\n   📝 Versions de contenu: {versions_count}")
        except:
            db.rollback()
            pass
        
        # Stats d'engagement
        # These columns (view_count, etc) are NOT in the Drill model I saw.
        # Removing this section to avoid errors.
        
        # Extension pgvector
        result = db.execute(text("SELECT * FROM pg_extension WHERE extname = 'vector'"))
        if result.fetchone():
            # embedding column is not in Drill model either based on previous view_file
            # Removing specific column check, just checking extension
            print(f"\n   🧬 Embeddings (pgvector):")
            print(f"      Extension: {GREEN}✅ Installée{NC}")
            
    except Exception as e:
        print(f"   {RED}❌ Erreur: {e}{NC}")
    finally:
        db.close()


def check_alembic_version():
    """Vérifie la version Alembic actuelle"""
    print_section("🔖", 6, "Version Alembic appliquée:")
    
    try:
        db = SessionLocal()
        result = db.execute(text("SELECT version_num FROM alembic_version"))
        version = result.fetchone()
        if version:
            print(f"   {GREEN}✅ Version actuelle: {version[0]}{NC}")
            print(f"   📅 Cela correspond à la migration appliquée sur la base")
        else:
            print(f"   {YELLOW}⚠️  Aucune migration appliquée{NC}")
            print("   💡 Exécuter: docker-compose exec backend alembic upgrade head")
        db.close()
    except Exception as e:
        print(f"   {RED}❌ Erreur: {e}{NC}")


def list_migration_history():
    """Liste l'historique des migrations disponibles"""
    print_section("📜", 7, "Historique des migrations disponibles:")
    
    migrations_dir = Path(__file__).parent.parent / "migrations" / "versions"
    # Adjusted path: scripts/../migrations/versions -> backend/migrations/versions
    # But wait, scripts is in backend/scripts. So parent is backend. 
    # Does backend have migrations? 
    # Step 574 shows 'alembic' dir, not 'migrations'. 
    # Usually alembic versions are in alembic/versions.
    
    migrations_dir = Path(__file__).parent.parent / "alembic" / "versions"
    
    if migrations_dir.exists():
        migration_files = sorted(migrations_dir.glob("*.py"))
        migration_files = [f for f in migration_files if f.name != "__pycache__" and not f.name.startswith("__")]
        
        if migration_files:
            print(f"   📁 Répertoire: {migrations_dir.relative_to(Path(__file__).parent.parent)}")
            print(f"   📊 Total: {len(migration_files)} migration(s)\n")
            
            for i, migration_file in enumerate(migration_files, 1):
                # Extraire l'ID de révision du nom de fichier
                name = migration_file.stem
                # Format typique: YYYYMMDD_description ou revision_description
                parts = name.split('_', 1)
                revision_id = parts[0]
                description = parts[1] if len(parts) > 1 else "No description"
                
                # Lire le fichier pour extraire la docstring
                try:
                    with open(migration_file, 'r') as f:
                        content = f.read()
                        # Chercher le docstring
                        if '"""' in content:
                            doc_start = content.find('"""') + 3
                            doc_end = content.find('"""', doc_start)
                            if doc_end > doc_start:
                                doc = content[doc_start:doc_end].strip()
                                if doc and len(doc) < 80:
                                    description = doc
                except:
                    pass
                
                marker = "→" if i == len(migration_files) else " "
                print(f"   {marker} {revision_id}: {description}")
        else:
            print(f"   {YELLOW}⚠️  Aucune migration trouvée dans le répertoire{NC}")
    else:
        print(f"   {RED}❌ Répertoire de migrations non trouvé: {migrations_dir}{NC}")
    
    print()
    print("   💡 Commandes utiles:")
    print("      • Appliquer toutes les migrations: alembic upgrade head")
    print("      • Créer une nouvelle migration: alembic revision --autogenerate -m 'description'")
    print("      • Voir l'historique: alembic history")


def main():
    """Fonction principale"""
    print("\n" + "=" * 80)
    print(f"{BLUE}🔍 CARLITOS COACH - Vérification de la Base de Données{NC}")
    print("=" * 80)
    
    # Vérifier la connexion
    if not check_database_connection():
        print(f"\n{RED}❌ Impossible de continuer sans connexion à la base de données{NC}")
        print("💡 Vérifiez que PostgreSQL est lancé: docker-compose ps postgres\n")
        sys.exit(1)
    
    # Exécuter toutes les vérifications
    list_databases()
    check_tables()
    show_table_details()
    count_records_by_table()
    check_alembic_version()
    list_migration_history()
    
    print("=" * 80)
    print(f"{GREEN}✅ Vérification terminée!{NC}")
    print("=" * 80)
    print()


if __name__ == "__main__":
    main()
