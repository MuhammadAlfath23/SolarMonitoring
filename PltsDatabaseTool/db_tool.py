#!/usr/bin/env python3
import os
import sys
import csv
import json
import subprocess
from datetime import datetime
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv
from tabulate import tabulate

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    print("\033[93m[WARNING] File .env tidak ditemukan! Menggunakan default sistem atau input manual.\033[0m")

# Database configuration from .env
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "plts")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "admin")
PG_DUMP_PATH = os.getenv("PG_DUMP_PATH", r"C:\Program Files\PostgreSQL\17\bin\pg_dump.exe")

# Ensure exports directory exists
EXPORTS_DIR = os.path.join(os.path.dirname(__file__), 'exports')
os.makedirs(EXPORTS_DIR, exist_ok=True)

# Formatting helpers for colored terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(title):
    print(f"\n{Colors.BOLD}{Colors.BLUE}======================================================================")
    print(f"  {title.upper()}")
    print(f"======================================================================{Colors.ENDC}")

def print_success(message):
    print(f"{Colors.GREEN}[SUCCESS] {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.FAIL}[ERROR] {message}{Colors.ENDC}")

def print_warning(message):
    print(f"{Colors.WARNING}[WARNING] {message}{Colors.ENDC}")

def get_connection():
    """Establishes a connection to the PostgreSQL database."""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            connect_timeout=3
        )
        return conn
    except Exception as e:
        print_error(f"Gagal terhubung ke database postgresql://{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}")
        print(f"Detail error: {e}")
        return None

def test_connection():
    """Option 1: Test connection and show server information."""
    print_header("Menguji Koneksi Database")
    conn = get_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            
            cursor.execute("SELECT current_database();")
            current_db = cursor.fetchone()[0]
            
            cursor.execute("SELECT pg_size_pretty(pg_database_size(current_database()));")
            db_size = cursor.fetchone()[0]
            
            print_success("Koneksi BERHASIL!")
            print(f"  - Host       : {DB_HOST}:{DB_PORT}")
            print(f"  - Database   : {current_db} ({db_size})")
            print(f"  - User       : {DB_USER}")
            print(f"  - Versi DB   : {version}")
            
            # Count tables
            cursor.execute("""
                SELECT count(*) 
                FROM information_schema.tables 
                WHERE table_schema = 'public';
            """)
            table_count = cursor.fetchone()[0]
            print(f"  - Jumlah Tabel: {table_count} tabel di skema 'public'")
            
            cursor.close()
        except Exception as e:
            print_error(f"Koneksi berhasil tetapi gagal menjalankan query info: {e}")
        finally:
            conn.close()
    else:
        print_warning("\nTips Troubleshooting:")
        print("1. Pastikan PostgreSQL Server sedang berjalan di localhost:5432.")
        print("2. Periksa kembali host, port, user, dan password di file .env Anda.")
        print(f"3. Pastikan database bernama '{DB_NAME}' sudah dibuat.")

def get_tables_list(conn):
    """Utility to get all user tables in public schema."""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
    """)
    tables = [row[0] for row in cursor.fetchall()]
    cursor.close()
    return tables

def show_database_schema():
    """Option 2: Explore database tables and their columns."""
    print_header("Eksplorasi Struktur Database (Schema)")
    conn = get_connection()
    if not conn:
        return
    
    try:
        tables = get_tables_list(conn)
        if not tables:
            print_warning("Tidak ditemukan tabel di skema 'public'. Database kosong atau Anda belum memigrasi tabel.")
            conn.close()
            return
            
        print(f"\nDitemukan {len(tables)} tabel:")
        for idx, table in enumerate(tables, 1):
            print(f"  {idx}. {Colors.BOLD}{table}{Colors.ENDC}")
            
        print("\n" + "-"*40)
        table_idx = input("Pilih nomor tabel untuk melihat detail kolom (atau tekan Enter untuk kembali): ").strip()
        if not table_idx:
            conn.close()
            return
            
        try:
            selected_table = tables[int(table_idx) - 1]
        except (ValueError, IndexError):
            print_error("Pilihan tidak valid!")
            conn.close()
            return
            
        cursor = conn.cursor()
        # Query column info
        cursor.execute("""
            SELECT 
                column_name, 
                data_type, 
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = %s
            ORDER BY ordinal_position;
        """, (selected_table,))
        
        columns = cursor.fetchall()
        
        # Query primary key information
        cursor.execute("""
            SELECT a.attname
            FROM   pg_index i
            JOIN   pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = any(i.indkey)
            WHERE  i.indrelid = %s::regclass AND i.indisprimary;
        """, (selected_table,))
        pks = [r[0] for r in cursor.fetchall()]
        
        # Prepare table view
        table_data = []
        for col in columns:
            name, dtype, nullable, default = col
            is_pk = "PK" if name in pks else ""
            table_data.append([name, dtype, nullable, default or '', is_pk])
            
        print(f"\n{Colors.BOLD}Struktur Kolom untuk Tabel: {selected_table}{Colors.ENDC}")
        print(tabulate(table_data, headers=["Kolom", "Tipe Data", "Nullable", "Default", "Key"], tablefmt="grid"))
        cursor.close()
        
    except Exception as e:
        print_error(f"Error saat membaca schema: {e}")
    finally:
        conn.close()

def run_custom_query():
    """Option 3: Type and run a custom SQL query."""
    print_header("Jalankan Query SQL Kustom")
    conn = get_connection()
    if not conn:
        return
        
    print("Masukkan query SQL Anda (contoh: SELECT * FROM nama_tabel LIMIT 10;):")
    print(f"{Colors.BLUE}(Ketik query di bawah dan akhiri dengan Enter){Colors.ENDC}")
    query = input("SQL > ").strip()
    
    if not query:
        conn.close()
        return
        
    # Standardize semicolon
    if not query.endswith(';'):
        query += ';'
        
    try:
        cursor = conn.cursor()
        cursor.execute(query)
        
        # Check if the query returns data
        if cursor.description:
            colnames = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
            
            print_success(f"Query berhasil dijalankan! Mengembalikan {len(rows)} baris.")
            
            if len(rows) == 0:
                print_warning("Hasil kosong (0 baris ditemukan).")
                cursor.close()
                conn.close()
                return
                
            # Limit display size in terminal to prevent cluttering
            display_rows = rows[:50]
            print(tabulate(display_rows, headers=colnames, tablefmt="psql"))
            
            if len(rows) > 50:
                print_warning(f"Menampilkan 50 baris pertama dari total {len(rows)} baris.")
                
            # Offer export
            print("\n" + "-"*40)
            export_choice = input("Apakah Anda ingin mengekspor hasil query ini? (y/n): ").strip().lower()
            if export_choice == 'y':
                export_format = input("Pilih format ekspor (1: CSV, 2: JSON): ").strip()
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                
                if export_format == '1':
                    filename = f"query_result_{timestamp}.csv"
                    filepath = os.path.join(EXPORTS_DIR, filename)
                    with open(filepath, 'w', newline='', encoding='utf-8') as f:
                        writer = csv.writer(f)
                        writer.writerow(colnames)
                        writer.writerows(rows)
                    print_success(f"Data berhasil diekspor ke: {filepath}")
                elif export_format == '2':
                    filename = f"query_result_{timestamp}.json"
                    filepath = os.path.join(EXPORTS_DIR, filename)
                    
                    json_data = []
                    for row in rows:
                        row_dict = {}
                        for i, col in enumerate(colnames):
                            val = row[i]
                            # Handle datetime objects
                            if isinstance(val, datetime):
                                val = val.isoformat()
                            row_dict[col] = val
                        json_data.append(row_dict)
                        
                    with open(filepath, 'w', encoding='utf-8') as f:
                        json.dump(json_data, f, indent=4, default=str)
                    print_success(f"Data berhasil diekspor ke: {filepath}")
                else:
                    print_error("Format ekspor tidak valid. Pembatalan ekspor.")
        else:
            # For INSERT, UPDATE, DELETE, CREATE, etc.
            conn.commit()
            print_success(f"Query DDL/DML berhasil dieksekusi. Status: {cursor.statusmessage}")
            
        cursor.close()
    except Exception as e:
        conn.rollback()
        print_error(f"Error saat mengeksekusi query: {e}")
    finally:
        conn.close()

def export_table_data():
    """Option 4: Export a whole database table to CSV or JSON."""
    print_header("Ekspor Data Tabel Utuh")
    conn = get_connection()
    if not conn:
        return
        
    try:
        tables = get_tables_list(conn)
        if not tables:
            print_warning("Tidak ada tabel untuk diekspor.")
            conn.close()
            return
            
        print("\nTabel yang tersedia untuk diekspor:")
        for idx, table in enumerate(tables, 1):
            print(f"  {idx}. {table}")
            
        print("\n" + "-"*40)
        table_idx = input("Pilih nomor tabel yang ingin diekspor (atau tekan Enter untuk kembali): ").strip()
        if not table_idx:
            conn.close()
            return
            
        try:
            selected_table = tables[int(table_idx) - 1]
        except (ValueError, IndexError):
            print_error("Pilihan tidak valid!")
            conn.close()
            return
            
        format_choice = input("Pilih format ekspor (1: CSV, 2: JSON): ").strip()
        if format_choice not in ['1', '2']:
            print_error("Format ekspor tidak valid!")
            conn.close()
            return
            
        cursor = conn.cursor()
        
        # Safely interpolate table name using psycopg2.sql
        query = sql.SQL("SELECT * FROM {}").format(sql.Identifier(selected_table))
        cursor.execute(query)
        
        colnames = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if format_choice == '1':
            filename = f"export_{selected_table}_{timestamp}.csv"
            filepath = os.path.join(EXPORTS_DIR, filename)
            with open(filepath, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(colnames)
                writer.writerows(rows)
            print_success(f"Seluruh tabel '{selected_table}' ({len(rows)} baris) berhasil diekspor ke CSV!")
            print(f"  - Path file: {filepath}")
            
        elif format_choice == '2':
            filename = f"export_{selected_table}_{timestamp}.json"
            filepath = os.path.join(EXPORTS_DIR, filename)
            
            json_data = []
            for row in rows:
                row_dict = {}
                for i, col in enumerate(colnames):
                    val = row[i]
                    if isinstance(val, datetime):
                        val = val.isoformat()
                    row_dict[col] = val
                json_data.append(row_dict)
                
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, indent=4, default=str)
            print_success(f"Seluruh tabel '{selected_table}' ({len(rows)} baris) berhasil diekspor ke JSON!")
            print(f"  - Path file: {filepath}")
            
        cursor.close()
    except Exception as e:
        print_error(f"Error saat mengekspor data: {e}")
    finally:
        conn.close()

def backup_database():
    """Option 5: Perform pg_dump backup safely using subprocess."""
    print_header("Backup Database PLTS (SQL Dump)")
    print(f"Detail Kredensial Backup:")
    print(f" - Host: {DB_HOST}:{DB_PORT}")
    print(f" - Database: {DB_NAME}")
    print(f" - Path pg_dump: '{PG_DUMP_PATH}'")
    print("-" * 50)
    
    # Check if pg_dump.exe exists
    if not os.path.exists(PG_DUMP_PATH):
        print_error(f"Executable pg_dump tidak ditemukan di path: {PG_DUMP_PATH}")
        print_warning("Mohon sesuaikan variabel PG_DUMP_PATH di file .env Anda jika lokasi instalasi berbeda.")
        return
        
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"backup_{DB_NAME}_{timestamp}.sql"
    backup_filepath = os.path.join(EXPORTS_DIR, backup_filename)
    
    print("Memulai proses backup...")
    
    # We pass the password securely via environment variables to avoid interactive prompts
    env_vars = os.environ.copy()
    env_vars["PGPASSWORD"] = DB_PASSWORD
    
    # Constructing arguments list. Python's subprocess.run handles spaces in arguments automatically,
    # resolving the issue where Windows shell parses space paths like "C:\Program Files" incorrectly.
    cmd = [
        PG_DUMP_PATH,
        "-h", DB_HOST,
        "-p", str(DB_PORT),
        "-U", DB_USER,
        "-F", "p",  # plain text (SQL script) format
        "-f", backup_filepath,
        DB_NAME
    ]
    
    try:
        # Run command synchronously
        result = subprocess.run(
            cmd,
            env=env_vars,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print_success("Backup Database BERHASIL!")
            print(f"  - File Backup: {backup_filepath}")
            # Display file size
            if os.path.exists(backup_filepath):
                size_kb = os.path.getsize(backup_filepath) / 1024
                print(f"  - Ukuran File: {size_kb:.2f} KB")
        else:
            print_error("Proses pg_dump mengembalikan kode error.")
            print(f"Detail Error: {result.stderr.strip()}")
            
    except Exception as e:
        print_error(f"Gagal menjalankan perintah pg_dump: {e}")

def main_menu():
    """Main CLI execution loop."""
    while True:
        print(f"\n{Colors.BOLD}{Colors.HEADER}======================================================================")
        print("  TOOL MONITORING & EKSPOR DATABASE PLTS (POSTGRESQL)")
        print(f"======================================================================{Colors.ENDC}")
        print("  1. Cek Koneksi Database & Info Server")
        print("  2. Lihat Struktur Tabel & Kolom (Schema Explorer)")
        print("  3. Jalankan Query SQL Kustom (Tampil & Ekspor)")
        print("  4. Ekspor Seluruh Isi Tabel (CSV / JSON)")
        print("  5. Backup Database (SQL Dump .sql)")
        print("  6. Keluar")
        print("-" * 70)
        
        choice = input("Pilih Menu [1-6]: ").strip()
        
        if choice == '1':
            test_connection()
        elif choice == '2':
            show_database_schema()
        elif choice == '3':
            run_custom_query()
        elif choice == '4':
            export_table_data()
        elif choice == '5':
            backup_database()
        elif choice == '6':
            print(f"\n{Colors.GREEN}Terima kasih telah menggunakan database utility tool. Sampai jumpa!{Colors.ENDC}\n")
            break
        else:
            print_error("Pilihan tidak valid! Masukkan angka antara 1 sampai 6.")
            
        input(f"\n{Colors.BLUE}Tekan Enter untuk kembali ke Menu Utama...{Colors.ENDC}")

if __name__ == "__main__":
    try:
        # Check python version
        if sys.version_info < (3, 6):
            print("[ERROR] Tool ini memerlukan Python versi 3.6 atau lebih tinggi.")
            sys.exit(1)
        main_menu()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.WARNING}Program dihentikan oleh pengguna. Sampai jumpa!{Colors.ENDC}\n")
        sys.exit(0)
