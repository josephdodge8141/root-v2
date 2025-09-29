#!/usr/bin/env python3
"""
Script to initialize Alembic migrations
Run this after setting up the project to create the initial migration structure
"""

import os
import subprocess
import sys


def run_command(command, cwd=None):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            cwd=cwd, 
            capture_output=True, 
            text=True, 
            check=True
        )
        print(f"✓ {command}")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {command}")
        print(f"Error: {e.stderr}")
        return False

def main():
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("Initializing Alembic migrations...")
    
    # Check if alembic/versions directory exists
    versions_dir = os.path.join(backend_dir, "alembic", "versions")
    if not os.path.exists(versions_dir):
        os.makedirs(versions_dir)
        print(f"✓ Created {versions_dir}")
    
    # Create initial migration
    if run_command("alembic revision --autogenerate -m 'Initial migration'", cwd=backend_dir):
        print("✓ Alembic initialization complete!")
        print("\nTo start the services and apply migrations:")
        print("  docker compose up -d --build")
        print("  docker compose exec backend alembic upgrade head")
    else:
        print("✗ Failed to initialize Alembic")
        sys.exit(1)

if __name__ == "__main__":
    main()