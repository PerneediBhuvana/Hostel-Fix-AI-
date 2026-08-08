from app import create_app
from app.extensions import db
from app.models import User
from app.utils import hash_password


def seed_data():
    app = create_app()
    with app.app_context():
        # Admin
        admin = User.query.filter_by(email='admin@college.edu').first()
        if not admin:
            admin = User(email='admin@college.edu', name='HOSTELFIX Admin')
            db.session.add(admin)
        admin.password_hash = hash_password('Admin@12345')
        admin.role = 'admin'
        admin.phone = '9999999999'

        # Faculty (Floor Coordinators)
        faculties = [
            ('faculty1@college.edu', 'Dr. Smith', 'Block A', '1', 'Computer Science', 'Smith@2026'),
            ('faculty2@college.edu', 'Dr. Johnson', 'Block A', '2', 'Electronics', 'Johnson@2026'),
            ('faculty3@college.edu', 'Dr. Williams', 'Block B', '1', 'Mechanical', 'Williams@2026')
        ]
        for email, name, block, floor, dept, password in faculties:
            faculty = User.query.filter_by(email=email).first()
            if not faculty:
                faculty = User(email=email, name=name)
                db.session.add(faculty)
            faculty.password_hash = hash_password(password)
            faculty.role = 'faculty'
            faculty.hostel_block = block
            faculty.floor = floor
            faculty.department = dept
            faculty.phone = '9876543201'

        # Wardens
        wardens = [
            ('warden1@college.edu', 'Warden Block A', 'Block A', 'WardenA@2026'),
            ('warden2@college.edu', 'Warden Block B', 'Block B', 'WardenB@2026')
        ]
        for email, name, block, password in wardens:
            warden = User.query.filter_by(email=email).first()
            if not warden:
                warden = User(email=email, name=name)
                db.session.add(warden)
            warden.password_hash = hash_password(password)
            warden.role = 'warden'
            warden.hostel_block = block
            warden.phone = '9876543210'

        # Maintenance Staff
        staff_members = [
            ('staff1@college.edu', 'Rajesh Kumar', 'Plumbing', 'Staff1@2026'),
            ('staff2@college.edu', 'Suresh Verma', 'Electrical', 'Staff2@2026'),
            ('staff3@college.edu', 'Ramesh Gupta', 'General', 'Staff3@2026')
        ]
        for email, name, dept, password in staff_members:
            staff = User.query.filter_by(email=email).first()
            if not staff:
                staff = User(email=email, name=name)
                db.session.add(staff)
            staff.password_hash = hash_password(password)
            staff.role = 'staff'
            staff.department = dept
            staff.phone = '9876543220'

        # Demo Student
        student = User.query.filter_by(email='student@college.edu').first()
        if not student:
            student = User(email='student@college.edu', name='Rahul Verma')
            db.session.add(student)
        student.password_hash = hash_password('Student@12345')
        student.role = 'student'
        student.hostel_block = 'Block A'
        student.floor = '1'
        student.room_no = '101'
        student.department = 'Computer Science'
        student.phone = '9876543230'

        db.session.commit()
        print('Seeded HOSTELFIX AI system accounts successfully:')
        print(' - Admin: admin@college.edu / Admin@12345')
        print(' - Faculty Coordinators:')
        print('     faculty1@college.edu / Smith@2026')
        print('     faculty2@college.edu / Johnson@2026')
        print('     faculty3@college.edu / Williams@2026')
        print(' - Wardens:')
        print('     warden1@college.edu / WardenA@2026')
        print('     warden2@college.edu / WardenB@2026')
        print(' - Staff:')
        print('     staff1@college.edu / Staff1@2026')
        print('     staff2@college.edu / Staff2@2026')
        print('     staff3@college.edu / Staff3@2026')
        print(' - Student: student@college.edu / Student@12345')


if __name__ == '__main__':
    seed_data()
