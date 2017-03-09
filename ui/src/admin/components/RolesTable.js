import React, {PropTypes} from 'react'
import RoleRow from 'src/admin/components/RoleRow'
import EmptyRow from 'src/admin/components/EmptyRow'
import FilterBar from 'src/admin/components/FilterBar'

const RolesTable = ({roles, allUsers, onDelete, onFilter, onAddUsersToRole}) => (
  <div className="panel panel-info">
    <FilterBar type="roles" onFilter={onFilter} />
    <div className="panel-body">
      <table className="table v-center admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Permissions</th>
            <th>Users</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {
            roles.length ?
              roles.filter(r => !r.hidden).map((role) =>
                <RoleRow key={role.name} allUsers={allUsers} role={role} onDelete={onDelete} onAddUsersToRole={onAddUsersToRole}/>
              ) : <EmptyRow tableName={'Roles'} />
          }
        </tbody>
      </table>
    </div>
  </div>
)

const {
  arrayOf,
  func,
  shape,
  string,
} = PropTypes

RolesTable.propTypes = {
  roles: arrayOf(shape({
    name: string.isRequired,
    permissions: arrayOf(shape({
      name: string,
      scope: string.isRequired,
    })),
    users: arrayOf(shape({
      name: string,
    })),
  })),
  onDelete: func.isRequired,
  onFilter: func,
  allUsers: arrayOf(shape()),
  onAddUsersToRole: func.isRequired,
}

export default RolesTable
